var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var config = require('./config.js');
var Wykop = require('wykop-es6');
var wykop = new Wykop(config.wykop.key, config.wykop.secret);
var md5 = require('md5');
var apiRouter = require('./api.js');
var adminRouter = require('./admin.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
var wykopController = require('./controllers/wykop.js');
var actionController = require('./controllers/actions.js');
var crypto = require('crypto');

const _port = 1337;
app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

app.set('view engine', 'jade');

app.get('/', (req, res)=>{
  res.render('index');
});
app.get('/voters/:entryID', (req, res)=>{
  wykopController.analyzeVoters(req.params.entryID, (err, voters)=>{
    if(err)return res.json(err);
    res.json(voters);
  });
});
app.get('/ip', (req, res)=>{
  res.json([req.ip, req.ips]);
});
app.post('/', (req, res)=>{
  var confession = new confessionModel();
  confession.text = req.body.text;
  confession.IPAdress = req.ip;
  confession.embed = req.body.embed;
  confession.auth = crypto.randomBytes(5).toString('hex');
  actionController(null, 0, function(err, actionId){
      if(err)return;
      confession.actions.push(actionId);
      confession.save((err)=>{
        if(err) res.send(err);
          res.render('index', {success: true, confession: confession});
      });
  });
});
app.get('/login', (req, res)=>{
  var redirectURL = encodeURIComponent(new Buffer(config.siteURL).toString('base64'));
  var secureKey = md5(config.wykop.secret+config.siteURL);
  res.redirect(`http://a.wykop.pl/user/connect/appkey,${config.wykop.key},userkey,,secure,${secureKey},redirect,${redirectURL}`);
});
app.get('/connect', (req, res)=>{
  //req.query.connectData
  var authDetails = JSON.parse(new Buffer(req.query.connectData, 'base64').toString('utf-8'));
  wykop.request('User', 'Login', {post: {accountkey: authDetails.token}}).then(function(response){
    userModel.findOneAndUpdate({username: response.login}, {avatar: response.avatar, userkey: response.userkey}, {upsert: true}, (err, loggedUser)=>{
      if(err) throw err;
      var token = jwt.sign(loggedUser, config.secret, {expiresIn: 1440*60});
      res.cookie('token', token);
      res.redirect('/');
    });
  });
});
app.get('/reply/:confessionid?', (req, res)=>{
  if(!req.params.confessionid){
    res.render('reply', {})
  }else{
    confessionModel.findById(req.params.confessionid, (err, confession)=>{
    if(err)return res.sendStatus(404);
    res.render('reply', {confession: confession});
    });
  }
});
app.post('/reply/:confessionid', (req, res)=>{
  confessionModel.findById(req.params.confessionid, (err, confession)=>{
    if(err)return res.sendStatus(404);
    if(confession){
    actionController(null, 4, function(err, actionId){
        if(err)return;
        confession.actions.push(actionId);
        confession.save();
    });
    var reply = new replyModel();
    reply.text = req.body.text;
    reply.IPAdress = req.ip;
    reply.embed = req.body.embed;
    reply.alias = req.body.alias || "Anon";
    if(reply.alias.trim() == confession.auth){
      reply.alias = "OP";
      reply.authorized = true;
    }
    reply.auth = crypto.randomBytes(5).toString('hex');
    reply.parentID = confession._id;
    reply.save((err)=>{
      if(err) res.send(err);
        res.render('reply', {success: true, reply: reply, confession: confession});
    });
    }else{
        return res.sendStatus(404);
    }
  });
});
app.get('/followers/:confessionid', (req, res)=>{
  confessionModel.findById(req.params.confessionid, (err, confession)=>{
    if(err)return res.sendStatus(404);
    if(confession){
    wykopController.getFollowers(confession.entryID, confession.notificationCommentId, (followers)=>{
      if(followers.length > 1){
      res.send(followers.substr(1));
      }else{
        res.json({success:false, response:{message: "Nikt nie obserwuje tego wątku"}});
      }
    });
  }else{
    res.sendStatus(404);
  }
  });
});
app.get('/cotojest', (req, res)=>{
  res.render('cotojest');
});
app.listen(_port, ()=>{
  console.log('listening on port '+_port);
});
