var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var wykop = require('./wykop.js');
var wykopController = require('./controllers/wykop.js');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');

mongoose.connect(config.mongoURL, (err)=>{
  if(err) throw err;
});
/* api router */
apiRouter.use((req, res, next)=>{
  var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
  if (err){
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    }else{
      req.decoded = decoded;
      next();
    }
  });
  }else{
    return res.status(403).json({
      success: false,
      response: {message: 'No token provided.'}
    });
  }
});
apiRouter.get('/', (req, res)=>{
  res.json({success: true, response: {message: 'API is working!'}});
});
apiRouter.route('/confession').get((req, res)=>{
  confessionModel.find((err, confessions)=>{
    if(err) res.send(err);
    res.json(confessions);
  });
});
apiRouter.route('/confession/accept/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) res.send(err);
    if(confession.entryID){
      res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID}});
      return;
    }
    var entryBody = `#AnonimoweMirkoWyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](http://p4nic.usermd.net/reply/${confession._id}) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( http://p4nic.usermd.net ) \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.`;
    wykop.request('Entries', 'Add', {post: {body: entryBody, embed: confession.embed}}, (err, response)=>{
      if(err) throw err;
      confession.entryID = response.id;
      wykop.request('Entries', 'AddComment', {params: [response.id], post: {body: `Zaplusuj ten komentarz, aby otrzymywać powiadomienia o odpowiedziach w tym wątku. [Kliknij tutaj, jeśli chcesz skopiować listę obserwujących](http://p4nic.usermd.net/followers/${confession._id})`}}, (err, notificationComment)=>{
        if(err)return console.log(err);
        confession.notificationCommentId = notificationComment.id;
        confession.save();
      });
      confession.accepted = true;
      confession.addedBy = req.decoded._doc.username;
      confession.save((err)=>{
        if(err) res.send(err);
        res.json({success: true, response: {message: 'Entry added', entryID: response.id}});
      });
    });
  });
});
apiRouter.route('/reply').get((req, res)=>{
  reply.find((err, replies)=>{
    if(err) res.send(err);
    res.json(replies);
  });
});
apiRouter.route('/reply/accept/:reply_id').get((req, res)=>{
  replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
    if(err) return console.log(err);
    if(reply.commentID){
      res.json({success: false, response: {message: 'It\'s already added', commentID: reply.commentID}});
      return;
    }
    var authorized = '';
    if(reply.authorized){
      authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**';
    }
    var entryBody = `**${reply.alias}**: ${reply.text}\n\nTo jest anonimowy komentarz${authorized}`;
    wykopController.getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId, (followers)=>{
      if(followers.length > 1)entryBody+=`\nWołam obserwujących: \n${followers}`;
      wykop.request('Entries', 'AddComment', {params: [reply.parentID.entryID], post: {body: entryBody, embed: reply.embed}}, (err, response)=>{
        if(err){console.log(err); return;}
        reply.commentID = response.id;
        reply.accepted = true;
        reply.addedBy = req.decoded._doc.username;
        reply.save((err)=>{
          if(err) res.json({success: false, response: {message: err}});
          res.json({success: true, response: {message: 'Reply added', commentID: response.id}});
        });
      });
    });
  });
});
module.exports = apiRouter;
