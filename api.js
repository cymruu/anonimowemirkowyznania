var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var wykopController = require('./controllers/wykop.js');
var surveyController = require('./controllers/survey.js');
var actionController = require('./controllers/actions.js');
var tagController = require('./controllers/tags.js');
var auth = require('./controllers/authorization.js');
var accessMiddleware = require('./controllers/access.js').accessMiddleware;
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var statsModel = require('./models/stats.js');
var replyModel = require('./models/reply.js');

mongoose.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
  if(err) throw err;
});
mongoose.Promise = global.Promise;
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
apiRouter.use(auth(true));
apiRouter.route('/confession/accept/:confession_id').get(accessMiddleware('addEntry'), (req, res)=>{
  confessionModel.findById(req.params.confession_id).populate('survey').exec((err, confession)=>{
    if(err) return res.send(err);
    if(confession.entryID && confession.status==1){
      return res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID, status: 'danger'}});
    }
    if(confession.status == -1){
      return res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
    }
    if(confession.survey){
      surveyController.acceptSurvey(confession, req.user, function(result){
        if(!result.success&&result.relogin){
          surveyController.wykopLogin();
        }
        if(result.success){
          wykopController.addNotificationComment(confession, req.user);
          statsModel.addAction('accepted_surveys', req.user.username);
        }
        return res.json(result);
      });
    }else{
      wykopController.acceptConfession(confession, req.user, function(result){
        if(result.success){
          wykopController.addNotificationComment(confession, req.user);
          statsModel.addAction('confessions_accepted', req.user.username);
        }
        return res.json(result);
      });
    }
  })
});
apiRouter.route('/confession/danger/:confession_id/:reason?').get(accessMiddleware('setStatus'), (req, res)=>{
  confessionModel.findById(req.params.confession_id, async(err, confession)=>{
    if(err) return res.json(err);
    confession.status==-1?confession.status=0:confession.status=-1;
    var status = confession.status==0?'warning':'danger';
    var actionType = confession.status==0?3:2;
    var reason = req.params.reason;
    var action = await actionController(req.user._id, actionType, reason).save();
    confession.actions.push(action);
    confession.save((err)=>{
      if(err) return res.json({success: false, response: {message: err}});
      if(confession.status === -1)statsModel.addAction('declined_confessions', req.user.username);
      res.json({success: true, response: {message: 'Zaaktualizowano status', status: status}});
    });
  });
});
apiRouter.route('/confession/tags/:confession_id/:tag').get(accessMiddleware('updateTags'), (req, res) => {
  //there's probably more clean way to do this.
  confessionModel.findById(req.params.confession_id, async (err, confession) => {
    if (err) return res.send(err);
    var action = await actionController(req.user._id, 9, req.params.tag).save();
    confession.update({ $set: { tags: tagController.prepareArray(confession.tags, req.params.tag) }, $push: { actions: action._id } }).then(success => {
      res.json({ success: true, response: { message: 'Tagi zaaktualizowano', status: 'success' } });
    }, function (err) {
      return res.json({ success: false, response: { message: err } });
    })
  });
});
apiRouter.route('/confession/delete/:confession_id').get(accessMiddleware('deleteEntry'), (req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) return res.send(err);
    wykopController.deleteEntry(confession.entryID, async(err, result, deletedEntry)=>{
      if(err) return res.json({success: false, response: {message: err.error.message}});
        var action = await actionController(req.user._id, 5).save();
        confession.status = -1;
        confession.actions.push(action);
        confession.save((err)=>{
          if(err)return res.json({success: false, response: {message: err}});
          statsModel.addAction('deleted_confessions', req.user.username);
          res.json({success: true, response: {message: `Usunięto wpis ID: ${result.id}`}});
          wykopController.sendPrivateMessage('sokytsinolop', `${req.user.username} usunął wpis \n ${deletedEntry.id}`, ()=>{});
      });
    });
  });
});
apiRouter.route('/reply/accept/:reply_id').get(accessMiddleware('addReply'), (req, res)=>{
  replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
    if(err) return res.json({success: false, response: {message: err, status: 'warning'}});
    if(reply.commentID){
      res.json({success: false, response: {message: 'It\'s already added', commentID: reply.commentID, status: 'danger'}});
      return;
    }
    if(reply.status == -1){
      res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
      return;
    }
    wykopController.acceptReply(reply, req.user, function(result){
      res.json(result);
      if(result.success)statsModel.addAction('replies_added', req.user.username);
    });
  });
});
apiRouter.route('/reply/danger/:reply_id/').get(accessMiddleware('setStatus'), (req, res)=>{
  replyModel.findById(req.params.reply_id).populate('parentID').exec(async(err, reply)=>{
    if(err) return res.json({success: false, response: {message: err, status: 'warning'}});
    reply.status==-1?reply.status=0:reply.status=-1;
    var status = reply.status==0?'warning':'danger';
    var actionType = reply.status==0?3:2;
    var action = await actionController(req.user._id, actionType).save();
    reply.parentID.actions.push(action);
    reply.parentID.save();
    reply.save((err)=>{
      if(err) res.json({success: false, response: {message: err}});
      if(reply.status === -1)statsModel.addAction('replies_declined', req.user.username);
      res.json({success: true, response: {message: 'Status zaaktualizowany', status: status}});
    });
  });
});
apiRouter.route('/reply/delete/:reply_id/').get(accessMiddleware('deleteReply'), (req, res)=>{
  replyModel.findOne({_id: req.params.reply_id}).populate('parentID').then(reply=>{
    wykopController.deleteComment(reply.parentID.entryID, reply.commentID, async(err, response, entry)=>{
      if(err){
        return res.json({success:false, response:{message:JSON.stringify(err), status:'success'}});
      }
      var action = await actionController(req.user._id, 7, `reply_id: ${response.id}`).save();
      reply.parentID.actions.push(action);
      reply.status = 0;
      reply.commentID = null;
      Promise.all([reply.save(), reply.parentID.save()]).then(success=>{
        return res.json({success: true, response: {message: "Reply removed", status: "danger"}});
      }).catch(err=>{
        return res.json({success:false, response: {message: "Reply removed but model not updated", status: "warning"}})
      });
    });
  }, err=>{
    res.json({success:false, response: {message: "Cant get reply", status: 'success'}})
  });
});
module.exports = apiRouter;
