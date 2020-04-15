var { wykop, service } = require('../wykop.js');
var bodyBuildier = require('../controllers/bodyBuildier.js');
var actionController = require('../controllers/actions.js');
var archiveModel = require('../models/archive.js');

const getFollowers = (notificationCommentId) => service.Entries.CommentUpvoters(notificationCommentId)

const getParticipants = (entryId) => {
  return service.Entries.Entry(entryId).then(response => response.comments.map(comment => comment.author.login))
}

const deleteModel = (getModel, deleteModel, modelId, findEl = undefined) => {
  return new Promise((resolve, reject) => {
    getModel(modelId).then(model => {
      let archive = new archiveModel();
      archive.item = findEl ? findEl(model, modelId) : model;
      archive.save().then(() => {
        deleteModel(modelId).then(result => {
          resolve(result)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  })
}

const deleteEntry = (entryId) => deleteModel(service.Entries.Entry, service.Entries.Delete, entryId)

const findCommentToDelete = (model, entryCommentId) => model.comments.find(e => e.id === entryCommentId)
const deleteEntryComment = (entryCommentId) => deleteModel(service.Entries.Entry, service.Entries.CommentDelete, entryCommentId, findCommentToDelete)

const sendPrivateMessage = (receiver, body) => service.Pm.SendMessage(receiver, body)

//TODO: refactor to return promise
const acceptConfession = (confession, user, cb) => {
  bodyBuildier.getEntryBody(confession, user, (entryBody) => {
    service.Entries.Add({ body: entryBody, embed: confession.embed })
      .then(response => {
        confession.entryID = response.id;
        var action = await actionController(user._id, 1).save();
        confession.actions.push(action);
        confession.status = 1;
        confession.addedBy = user.username;
        confession.save((err) => {
          if (err) return cb({ success: false, response: { message: err } });
          cb({ success: true, response: { message: 'Entry added', entryID: response.id, status: 'success' } });
        });
      })
      .catch(err => {
        return cb({ success: false, response: { message: err.toString(), status: 'warning' } });
      })
  })
}

//TODO: refactor to use promise
addNotificationComment = function (confession, user, cb) {
  cb = cb || function () { };
  service.Entries.CommentAdd(confession.entryID, { body: bodyBuildier.getNotificationCommentBody(confession) })
    .then(response => {
      confession.notificationCommentId = notificationComment.id;
      var action = await actionController(user._id, 6).save();
      confession.actions.push(action);
      confession.save();
      return cb({ success: true, response: { message: 'notificationComment added', status: 'success' } });
    })
    .catch(err => {
      return cb({ success: false, response: { message: err.toString(), status: 'error' } });
    })
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
  acceptConfession, acceptReply, deleteEntry, deleteEntryComment, sendPrivateMessage, getParticipants, addNotificationComment, getFollowers, wykop
};
