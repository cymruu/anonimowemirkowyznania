var wykop = require('../wykop.js');
var tagController = require('../controllers/tags.js');
var actionController = require('../controllers/actions.js');
var config = require('../config.js');
getFollowers = function(entryID, notificationCommentId, cb){
  var followers = [];
  if(!notificationCommentId){
    return cb(followers);
  }
  wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
    if(err)return console.log(err);
    for(var i in entry.comments){
      var current = entry.comments[i];
      if (current.id == notificationCommentId){
        if(current.voters){
          for(i in current.voters){
            followers.push(current.voters[i].author);
          }
        }
      }
    }
    return cb(followers);
  });
}
/**
 * get entry participants
 * @param  {int}   entryID entryID
 * @param  {Function} cb      callback
 */
getParticipants = function(entryID, cb){
  wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
    var participants = [];
    if(err) return cb(err);
    participants.push(entry.author);
    for(var i in entry.comments){
      if(participants.indexOf(entry.comments[i].author)==-1){
      participants.push(entry.comments[i].author);
      }
    }
    cb(null, participants);
  });
}
deleteEntry = function(entryID, cb){
  var archiveModel = require('../models/archive.js');
  wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
    if(err) return cb(err);
    var archive = new archiveModel();
    archive.entry = entry;
    archive.save((err)=>{
      if(err) return cb(err);
      wykop.request('Entries', 'Delete', {params: [entryID]}, (err, response)=>{
        if(err) return cb(err);
        return cb(null, response, entry);
      });
    });
  });
}
sendPrivateMessage = function(recipient, body, cb){
  wykop.request('PM', 'SendMessage', {params: [recipient], post: {body}}, (err, response)=>{
    if(err)return cb(err);
    cb(null, response);
  });
}
acceptConfession = function(confession, req, cb){
  var entryBody = `#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \n[Kliknij tutaj, aby wysłać OPowi anonimową wiadomość prywatną](${config.siteURL}/conversation/${confession._id}/new) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: ${req.decoded._doc.username}`;
  wykop.request('Entries', 'Add', {post: {body: tagController.trimTags(entryBody, confession.tags), embed: confession.embed}}, (err, response)=>{
    if(err){
      var err = JSON.parse(err);
      if(err.error.code==11){
        wykop.relogin();
      }
      return cb({success: false, response: {message: JSON.stringify(err), status: 'warning'}});
    }
    confession.entryID = response.id;
    actionController(confession, req.decoded._doc._id, 1);
    confession.status = 1;
    confession.addedBy = req.decoded._doc.username;
    confession.save((err)=>{
      if(err)return cb({success: false, response: {message: err}});
      cb({success: true, response: {message: 'Entry added', entryID: response.id, status: 'success'}});
    });
  });
}
addNotificationComment = function(confession, req, cb){
  cb=cb||function(){};
  wykop.request('Entries', 'AddComment', {params: [confession.entryID], post: {body: `Zaplusuj ten komentarz, aby otrzymywać powiadomienia o odpowiedziach w tym wątku. [Kliknij tutaj, jeśli chcesz skopiować listę obserwujących](${config.siteURL}/followers/${confession._id})`}}, (err, notificationComment)=>{
    if(err) return cb({success: false, response: {message: err, status: 'error'}});
    confession.notificationCommentId = notificationComment.id;
    actionController(confession, req.decoded._doc._id, 6);
    confession.save();
    return cb({success: true, response: {message: 'notificationComment added', status: 'success'}});
  });
}
acceptReply = function(reply, req, cb){
  var authorized = '';
  if(reply.authorized){
    authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**';
  }
  var entryBody = `**${reply.alias}**: ${reply.text}\n${authorized}\nZaakceptował: ${req.decoded._doc.username}`;
  getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId, (followers)=>{
    if(followers.length > 0)entryBody+=`\n! Wołam obserwujących: ${followers.map(function(f){return '@'+f;}).join(', ')}`;
    wykop.request('Entries', 'AddComment', {params: [reply.parentID.entryID], post: {body: entryBody, embed: reply.embed}}, (err, response)=>{
      if(err){return cb({success: false, response: {message: JSON.stringify(err), status: 'warning'}});}
      reply.commentID = response.id;
      reply.status = 1;
      reply.addedBy = req.decoded._doc.username;
      actionController(reply.parentID, req.decoded._doc._id, 8);
      reply.save((err)=>{
        if(err) return cb({success: false, response: {message: err}});
        cb({success: true, response: {message: 'Reply added', commentID: response.id, status: 'success'}});
      });
    });
  });
}
module.exports = {
    acceptConfession, acceptReply, deleteEntry, sendPrivateMessage, getParticipants, addNotificationComment, getFollowers
};
