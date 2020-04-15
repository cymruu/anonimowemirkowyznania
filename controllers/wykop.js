var { wykop, service } = require('../wykop.js');
var bodyBuildier = require('../controllers/bodyBuildier.js');
var actionController = require('../controllers/actions.js');
var archiveModel = require('../models/archive.js');
const logger = require('../logger.js');

const getFollowers = (notificationCommentId) => service.Entries.CommentUpvoters(notificationCommentId)

const getParticipants = (entryId) => {
  return service.Entries.Entry(entryId).then(response => response.comments.map(comment => comment.author.login))
}

const deleteEntry = (entryId) => {
  return service.Entries.Entry(entryId).then(entryToDelete => {
    let archive = new archiveModel();
    archive.item = entryToDelete;
    archive.save().then(() => {
      return service.Entries.Delete(entryToDelete.id)
    })
  })
}

const deleteEntryComment = (entryCommentId) => {
  service.Entries.Comment(entryCommentId).then(comment => {
    let archive = new archiveModel();
    archive.item = comment;
    archive.save().then(() => {
      return service.Entries.CommentDelete(entryCommentId);
    })
  })
}

const sendPrivateMessage = (receiver, body) => service.Pm.SendMessage(receiver, body)

//TODO: refactor to return promise
const acceptConfession = (confession, user, cb) => {
  bodyBuildier.getEntryBody(confession, user, (entryBody) => {
    service.Entries.Add({ body: entryBody, embed: confession.embed })
      .then(async (response) => {
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
        logger.error(err);
        return cb({ success: false, response: { message: err.toString(), status: 'warning' } });
      })
  })
}

//TODO: refactor to use promise
const addNotificationComment = function (confession, user, cb) {
  cb = cb || function () { };
  service.Entries.CommentAdd(confession.entryID, { body: bodyBuildier.getNotificationCommentBody(confession) })
    .then(async (response) => {
      confession.notificationCommentId = response.id;
      var action = await actionController(user._id, 6).save();
      confession.actions.push(action);
      confession.save();
      return cb({ success: true, response: { message: 'notificationComment added', status: 'success' } });
    })
    .catch(err => {
      logger.error(err);
      return cb({ success: false, response: { message: err.toString(), status: 'error' } });
    })
}

const acceptReply = async (reply, user, cb) => {
  var entryBody = bodyBuildier.getCommentBody(reply, user);
  try {
    const entryFollowers = await getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId)
    if (entryFollowers.length > 0) {
      if (followers.length > 0) entryBody += `\n! Wołam obserwujących: ${entryFollowers.map(x => `@${x.author.login}`).join(', ')}`;
    }
    try {
      const response = await service.Entries.CommentAdd(reply.parentID.entryID, { body: entryBody, embed: reply.embed })
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
    } catch (err) {
      logger.error(err);
      return cb({ success: false, response: { message: err.toString(), status: 'warning' } });
    }
  } catch (err) {
    logger.error(err);
    return cb({ success: false, response: { message: err.toString() } });
  }
}

module.exports = {
  acceptConfession, acceptReply, deleteEntry, deleteEntryComment, sendPrivateMessage, getParticipants, addNotificationComment, getFollowers, wykop
};
