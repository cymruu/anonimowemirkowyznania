var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var wykop = require('./wykop.js');
var wykopController = require('./controllers/wykop.js');
var actionController = require('./controllers/actions.js');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');

mongoose.connect(config.mongoURL, (err)=>{
  if(err) throw err;
});
/* api router */
apiRouter.get('/', (req, res)=>{
  res.json({success: true, response: {message: 'API is working!'}});
});
apiRouter.get('/participants/:entry_id', (req, res)=>{
  wykopController.getParticipants(req.params.entry_id, (err, participants)=>{
    if(err)return res.json(err);
    res.json(participants);
  });
});
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
apiRouter.route('/confession').get((req, res)=>{
  confessionModel.find((err, confessions)=>{
    if(err) res.send(err);
    res.json(confessions);
  });
});
apiRouter.route('/confession/accept/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) res.send(err);
    if(confession.entryID && confession.status==1){
      res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID, status: 'danger'}});
      return;
    }
    if(confession.status == -1){
      res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
      return;
    }
    var entryBody = `#AnonimoweMirkoWyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: ${req.decoded._doc.username} \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.`;
    wykop.request('Entries', 'Add', {post: {body: entryBody, embed: confession.embed}}, (err, response)=>{
      if(err){res.json({success: false, response: {message: JSON.stringify(err), status: 'warning'}}); throw err;}
      confession.entryID = response.id;
      wykop.request('Entries', 'AddComment', {params: [response.id], post: {body: `Zaplusuj ten komentarz, aby otrzymywać powiadomienia o odpowiedziach w tym wątku. [Kliknij tutaj, jeśli chcesz skopiować listę obserwujących](${config.siteURL}/followers/${confession._id})`}}, (err, notificationComment)=>{
        if(err)return console.log(err);
      actionController(req.decoded._doc._id, 1, function(err, actionId){
        if(err)return err;
        confession.actions.push(actionId);
        confession.status = 1;
        confession.addedBy = req.decoded._doc.username;
        confession.notificationCommentId = notificationComment.id;
        confession.save((err)=>{
          if(err) res.json({success: false, response: {message: err}});;
          res.json({success: true, response: {message: 'Entry added', entryID: response.id, status: 'success'}});
          });
        });
      });
    });
  });
});
apiRouter.route('/confession/danger/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) return res.json(err);
    confession.status==-1?confession.status=0:confession.status=-1;
    var status = confession.status==0?'warning':'danger';
    var actionType = confession.status==0?3:2;
    actionController(req.decoded._doc._id, actionType, function(err, actionId){
      if(err)return err;
      confession.actions.push(actionId);
      confession.save((err)=>{
        if(err) res.json({success: false, response: {message: err}});
        res.json({success: true, response: {message: 'Zaaktualizowano status', status: status}});
      });
    });
  });
});
apiRouter.route('/confession/delete/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) return res.json(err);
    wykopController.deleteEntry(confession.entryID, (err, result)=>{
      if(err) return res.json({success: false, response: {message: err.error.message}});
        actionController(req.decoded._doc._id, 5, function(err, actionId){
          if(err)return err;
          confession.actions.push(actionId);
          confession.status = -1;
          confession.save((err)=>{
            if(err) res.json({success: false, response: {message: err}});
            res.json({success: true, response: {message: `Usunięto wpis ID: ${result.id}`}});
          });
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
      res.json({success: false, response: {message: 'It\'s already added', commentID: reply.commentID, status: 'danger'}});
      return;
    }
    if(reply.status == -1){
      res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
      return;
    }
    var authorized = '';
    if(reply.authorized){
      authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**';
    }
    var entryBody = `**${reply.alias}**: ${reply.text}\n\nTo jest anonimowy komentarz.${authorized}\nZaakceptował: ${req.decoded._doc.username}`;
    wykopController.getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId, (followers)=>{
      if(followers.length > 0)entryBody+=`\n! Wołam obserwujących: ${followers.map(function(f){return '@'+f;}).join(', ')}`;
      wykop.request('Entries', 'AddComment', {params: [reply.parentID.entryID], post: {body: entryBody, embed: reply.embed}}, (err, response)=>{
        if(err){res.json({success: false, response: {message: JSON.stringify(err), status: 'warning'}}); return;}
        reply.commentID = response.id;
        reply.status = 1;
        reply.addedBy = req.decoded._doc.username;
        actionController(req.decoded._doc._id, 8, function(err, actionId){
          if(err)return;
          reply.parentID.actions.push(actionId);
          reply.parentID.save();
        });
        reply.save((err)=>{
          if(err) res.json({success: false, response: {message: err}});
          res.json({success: true, response: {message: 'Reply added', commentID: response.id, status: 'success'}});
        });
      });
    });
  });
});
apiRouter.route('/reply/danger/:reply_id').get((req, res)=>{
  replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
    if(err) return console.log(err);
    var message = '';
    reply.status==-1?reply.status=0:reply.status=-1;
    var status = reply.status==0?'warning':'danger';
    var actionType = reply.status==0?3:2;
    reply.save((err)=>{
      if(err) res.json({success: false, response: {message: err}});
      actionController(req.decoded._doc._id, actionType, function(err, actionId){
        if(err)return;
        reply.parentID.actions.push(actionId);
        reply.parentID.save();
      });
      res.json({success: true, response: {message: 'Status zaaktualizowany', status: status}});
    });
  });
});
module.exports = apiRouter;
