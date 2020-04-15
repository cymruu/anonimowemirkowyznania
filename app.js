if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}
var _port = 1337;
if (typeof (PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
  _port = 'passenger';
}
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var apiRouter = require('./api.js');
var adminRouter = require('./admin.js');
var conversationRouter = require('./conversation.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var advertismentModel = require('./models/ads.js');
var statsModel = require('./models/stats.js');

var wykopController = require('./controllers/wykop.js');
var actionController = require('./controllers/actions.js');
var tagController = require('./controllers/tags.js');
var auth = require('./controllers/authorization.js');
var aliasGenerator = require('./controllers/aliases.js');
var surveyController = require('./controllers/survey.js');
var crypto = require('crypto');
const { options, isObjectEmpty } = require('./certs.js');
const logger = require('./logger.js');

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/conversation', conversationRouter);
app.use(auth(false));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index');
});
app.post('/', async (req, res) => {
  var confession = new confessionModel();
  if (req.body.survey && req.body.survey.question) {
    req.body.survey.answers = req.body.survey.answers.filter((e) => { return e })
    var validationResult = surveyController.validateSurvey(req.body.survey);
    if (validationResult.success == false) return res.send(validationResult.response.message);
  } else {
    delete req.body.survey;
  }
  req.body.text = req.body.text || '';
  confession.text = req.body.text;
  confession.IPAdress = req.ip;
  confession.remotePort = req.connection.remotePort;
  confession.embed = req.body.embed;
  confession.tags = tagController.getTags(req.body.text);
  confession.auth = crypto.randomBytes(5).toString('hex');
  var action = await actionController(null, 0).save();
  confession.actions.push(action);
  confession.save((err) => {
    if (err) return res.send(err);
    if (req.body.survey) {
      surveyController.saveSurvey(confession, req.body.survey);
      statsModel.addAction('new_surveys');
    }
    statsModel.addAction('new_confessions');
    res.redirect(`confession/${confession._id}/${confession.auth}`);
  });
});
app.get('/confession/:confessionid/:auth', (req, res) => {
  if (!req.params.confessionid || !req.params.auth) {
    return res.sendStatus(400);
  } else {
    confessionModel.findOne({ _id: req.params.confessionid, auth: req.params.auth }).populate([{ path: 'actions', options: { sort: { _id: -1 } }, populate: { path: 'user', select: 'username' } }, { path: 'survey' }]).exec((err, confession) => {
      if (err) return res.send(err);
      if (!confession) return res.sendStatus(404);
      res.render('confession', { confession: confession });
    });
  }
});
app.get('/reply/:confessionid?', (req, res) => {
  if (!req.params.confessionid) {
    return res.sendStatus(400);
  } else {
    confessionModel.findById(req.params.confessionid, (err, confession) => {
      if (err) return res.sendStatus(404);
      wykopController.getParticipants(confession.entryID).then(participants => {
        confession.participants = participants;
      }).catch(_ => {
        confession.participants = [];
      }).finally(() => {
        res.render('reply', { confession: confession });
      });
    })
  }
});
app.post('/reply/:confessionid', (req, res) => {
  confessionModel.findById(req.params.confessionid, (err, confession) => {
    if (err) return res.sendStatus(404);
    if (confession) {
      var reply = new replyModel();
      reply.text = req.body.text;
      reply.IPAdress = req.ip;
      reply.remotePort = req.connection.remotePort;
      reply.embed = req.body.embed;
      reply.alias = req.body.alias || aliasGenerator(Math.random() >= 0.5);
      if (reply.alias.trim() == confession.auth) {
        reply.alias = "OP";
        reply.authorized = true;
      }
      reply.auth = crypto.randomBytes(5).toString('hex');
      reply.parentID = confession._id;
      reply.save(async (err) => {
        if (err) res.send(err);
        statsModel.addAction('new_reply');
        var action = await actionController(null, 4).save();
        confession.actions.push(action);
        confession.save();
        res.render('reply', { success: true, reply: reply, confession: confession });
      });
    } else {
      return res.sendStatus(404);
    }
  });
});
app.get('/followers/:confessionid', (req, res) => {
  confessionModel.findById(req.params.confessionid, ['notificationCommentId'], (err, confession) => {
    if (err) return res.sendStatus(500);
    if (!confession) return res.sendStatus(404);
    wykopController.getFollowers(confession.notificationCommentId)
      .then(result => {
        res.send(result.map(x => `@${x.author.login}`).join(', '))
      })
      .catch(err => {
        res.json(err);
      })
  })
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/twojewyznania', (req, res) => {
  res.render('confessionsList');
});
app.get('/contact', (req, res) => {
  res.render('contact');
});
app.get('/link/:linkId/:from', function (req, res) {
  advertismentModel.findOne({ _id: req.params.linkId }, function (err, ad) {
    if (err || !ad) return res.sendStatus(404);
    ad.visits.push({ IPAdress: req.ip, from: req.params.from });
    ad.save();
    res.redirect(ad.out);
  });
});
if (_port == "passenger") {
  app.listen(_port);
} else {
  var server;
  if (isObjectEmpty(options)) {
    var http = require('http');
    server = http.createServer(app);
  } else {
    var https = require('https');
    server = https.createServer(options, app);
  }
  server.listen(_port, () => {
    logger.info(`Server started on port: ${_port} [${process.env.NODE_ENV}]`)
  });
}