var { wykop, service } = require('../wykop.js');
var bodyBuildier = require('../controllers/bodyBuildier.js');
var actionController = require('../controllers/actions.js');

const getFollowers = (notificationCommentId) => service.Entries.CommentUpvoters(notificationCommentId)
/**
 * get entry participants
 * @param  {int}   entryID entryID
 * @param  {Function} cb      callback
 */
const getParticipants = (entryId) => {
  return service.Entries.Entry(entryId).then(response => response.comments.map(comment => comment.author.login)
}
deleteEntry = function (entryID, cb) {
  var archiveModel = require('../models/archive.js');
  wykop.request('Entries', 'Index', { params: [entryID] }, (err, entry) => {
    if (err) return cb(err);
    var archive = new archiveModel();
    archive.entry = entry;
    archive.save((err) => {
      if (err) return cb(err);
      wykop.request('Entries', 'Delete', { params: [entryID] }, (err, response) => {
        if (err) return cb(err);
        return cb(null, response, entry);
      });
    });
  });
}
deleteComment = function (entryID, commentID, cb) {
  var archiveModel = require('../models/archive.js');
  wykop.request('Entries', 'Index', { params: [entryID] }, (err, entry) => {
    if (err) return cb(err);
    var archive = new archiveModel();
    archive.entry = entry['comments'].find(e => e.id == commentID);
    archive.save((err) => {
      if (err) return cb(err);
      wykop.request('Entries', 'DeleteComment', { params: [entryID, commentID] }, (err, response) => {
        if (err) return cb(err);
        return cb(null, response, entry);
      });
    });
  });
}
sendPrivateMessage = function (recipient, body, cb) {
  wykop.request('PM', 'SendMessage', { params: [recipient], post: { body } }, (err, response) => {
    if (err) return cb(err);
    cb(null, response);
  });
}
acceptConfession = function (confession, user, cb) {
  bodyBuildier.getEntryBody(confession, user, function (entryBody) {
    wykop.request('Entries', 'Add', { post: { body: entryBody, embed: confession.embed } }, async (err, response) => {
      if (err) {
        if (err.error.code === 11 || err.error.code === 12 || err.error.code === 13) wykop.relogin();
        return cb({ success: false, response: { message: JSON.stringify(err), status: 'warning' } });
      }
      confession.entryID = response.id;
      var action = await actionController(user._id, 1).save();
      confession.actions.push(action);
      confession.status = 1;
      confession.addedBy = user.username;
      confession.save((err) => {
        if (err) return cb({ success: false, response: { message: err } });
        cb({ success: true, response: { message: 'Entry added', entryID: response.id, status: 'success' } });
      });
    });
  });
}
addNotificationComment = function (confession, user, cb) {
  cb = cb || function () { };
  wykop.request('Entries', 'AddComment', { params: [confession.entryID], post: { body: bodyBuildier.getNotificationCommentBody(confession) } }, async (err, notificationComment) => {
    if (err) return cb({ success: false, response: { message: err, status: 'error' } });
    confession.notificationCommentId = notificationComment.id;
    var action = await actionController(user._id, 6).save();
    confession.actions.push(action);
    confession.save();
    return cb({ success: true, response: { message: 'notificationComment added', status: 'success' } });
  });
}
acceptReply = function (reply, user, cb) {
  var entryBody = bodyBuildier.getCommentBody(reply, user);
  getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId, (err, followers) => {
    if (err) return cb({ success: false, response: { message: JSON.stringify(err) } });
    if (followers.length > 0) entryBody += `\n! Wołam obserwujących: ${followers.map(function (f) { return '@' + f; }).join(', ')}`;
    wykop.request('Entries', 'AddComment', { params: [reply.parentID.entryID], post: { body: entryBody, embed: reply.embed } }, async (err, response) => {
      if (err) {
        if (err.error.code === 11 || err.error.code === 12 || err.error.code === 13) wykop.relogin();
        return cb({ success: false, response: { message: JSON.stringify(err), status: 'warning' } });
      }
      reply.commentID = response.id;
      reply.status = 1;
      reply.addedBy = user.username;
      var action = await actionController(user._id, 8).save();
      reply.parentID.actions.push(action);
      reply.parentID.save();
      reply.save((err) => {
        if (err) return cb({ success: false, response: { message: JSON.stringify(err) } });
        cb({ success: true, response: { message: 'Reply added', commentID: response.id, status: 'success' } });
      });
    });
  });
}
module.exports = {
  acceptConfession, acceptReply, deleteEntry, deleteComment, sendPrivateMessage, getParticipants, addNotificationComment, getFollowers, wykop
};
