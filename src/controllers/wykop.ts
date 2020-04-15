import { service } from '../wykop'
import bodyBuildier from '../controllers/bodyBuildier'
import actionController from '../controllers/actions'
import archiveModel from '../models/archive'
import logger from '../logger'

export const getFollowers = (notificationCommentId) => service.Entries.CommentUpvoters(notificationCommentId)

export const getParticipants = (entryId) => {
	return service.Entries.Entry(entryId).then(response => response.comments.map(comment => comment.author.login))
}

export const deleteEntry = (entryId) => {
	return service.Entries.Entry(entryId).then(entryToDelete => {
		const archive = new archiveModel()
		archive.item = entryToDelete
		archive.save().then(() => {
			return service.Entries.Delete(entryToDelete.id)
		})
	})
}

export const deleteEntryComment = (entryCommentId) => {
	return service.Entries.Comment(entryCommentId).then(comment => {
		const archive = new archiveModel()
		archive.item = comment
		archive.save().then(() => {
			return service.Entries.CommentDelete(entryCommentId)
		})
	})
}

export const sendPrivateMessage = (receiver, body) => service.Pm.SendMessage(receiver, body)

//TODO: refactor to return promise
export const acceptConfession = (confession, user, cb) => {
	bodyBuildier.getEntryBody(confession, user, (entryBody) => {
		service.Entries.Add({ body: entryBody, embed: confession.embed })
			.then(async (response) => {
				confession.entryID = response.id
				const action = await actionController(user._id, 1).save()
				confession.actions.push(action)
				confession.status = 1
				confession.addedBy = user.username
				confession.save((err) => {
					if (err) { return cb({ success: false, response: { message: err } }) }
					cb({ success: true, response: { message: 'Entry added', entryID: response.id, status: 'success' } })
				})
			})
			.catch(err => {
				logger.error(err)
				return cb({ success: false, response: { message: err.toString(), status: 'warning' } })
			})
	})
}

//TODO: refactor to use promise
export const addNotificationComment = function(confession, user, cb = () => { }) {
	service.Entries.CommentAdd(confession.entryID, { body: bodyBuildier.getNotificationCommentBody(confession) })
		.then(async (response) => {
			confession.notificationCommentId = response.id
			const action = await actionController(user._id, 6).save()
			confession.actions.push(action)
			confession.save()
			return cb({ success: true, response: { message: 'notificationComment added', status: 'success' } })
		})
		.catch(err => {
			logger.error(err)
			return cb({ success: false, response: { message: err.toString(), status: 'error' } })
		})
}

export const acceptReply = async (reply, user, cb) => {
	let entryBody = bodyBuildier.getCommentBody(reply, user)
	try {
		const entryFollowers = await getFollowers(reply.parentID.notificationCommentId)
		if (entryFollowers.length > 0) {
			if (entryFollowers.length > 0) { entryBody += `\n! Wołam obserwujących: ${entryFollowers.map(x => `@${x.author.login}`).join(', ')}` }
		}
		try {
			const response = await service.Entries.CommentAdd(reply.parentID.entryID, { body: entryBody, embed: reply.embed })
			reply.commentID = response.id
			reply.status = 1
			reply.addedBy = user.username
			const action = await actionController(user._id, 8).save()
			reply.parentID.actions.push(action)
			reply.parentID.save()
			reply.save((err) => {
				if (err) { return cb({ success: false, response: { message: JSON.stringify(err) } }) }
				cb({ success: true, response: { message: 'Reply added', commentID: response.id, status: 'success' } })
			})
		} catch (err) {
			logger.error(err)
			return cb({ success: false, response: { message: err.toString(), status: 'warning' } })
		}
	} catch (err) {
		logger.error(err)
		return cb({ success: false, response: { message: err.toString() } })
	}
}
