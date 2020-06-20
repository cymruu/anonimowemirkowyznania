import { service } from '../wykop'
import bodyBuildier from '../controllers/bodyBuildier'
import { createAction, ActionType } from '../controllers/actions'
import archiveModel from '../models/archive'
import logger from '../logger'
import { CommentUpvoter } from 'wypokjs/dist/models/Upvoter'
import { IConfession } from '../models/confession'

export const getFollowers = (notificationCommentId): Promise<CommentUpvoter[]> => {
	if (!Number.isInteger(notificationCommentId)) {
		return Promise.resolve([])
	}
	return service.Entries.CommentUpvoters(notificationCommentId)
}

export const getParticipants = (entryId) => {
	if (!Number.isInteger(entryId)) {
		return Promise.reject(new Error('Not numeric entry ID'))
	}
	return service.Entries.Entry(entryId)
		.then(response => response.comments.map(comment => comment.author.login))
		.then(mapped => Array.from(new Set(mapped).values()))
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

export const acceptConfession = (confession: IConfession, entryBody: string, adultmedia: boolean = false) => {
	return service.Entries.Add({ body: entryBody, embed: confession.embed, adultmedia })
}

//TODO: refactor like addEntry
export const addNotificationComment = function(confession, user, cb = (...args) => { }) {
	service.Entries.CommentAdd(confession.entryID, { body: bodyBuildier.getNotificationCommentBody(confession) })
		.then(async (response) => {
			confession.notificationCommentId = response.id
			const action = await createAction(user._id, ActionType.ADD_NOTIFICATION_COMMENT).save()
			confession.actions.push(action)
			confession.save()
			return cb({ success: true, response: { message: 'notificationComment added', status: 'success' } })
		})
		.catch(err => {
			logger.error(err)
			return cb({ success: false, response: { message: err.toString(), status: 'error' } })
		})
}
//TODO: refactor like addEntry
export const acceptReply = async (reply, user, cb) => {
	let entryBody = bodyBuildier.getCommentBody(reply, user)
	try {
		const entryFollowers = await getFollowers(reply.parentID.notificationCommentId)
		if (entryFollowers.length > 0) {
			if (entryFollowers.length > 0) {
				entryBody += `\n! Wołam obserwujących: ${entryFollowers.map(x => `@${x.author.login}`).join(', ')}`
			}
		}
		try {
			const response = await service.Entries.CommentAdd(
				reply.parentID.entryID, { body: entryBody, embed: reply.embed },
			)
			reply.commentID = response.id
			reply.status = 1
			reply.addedBy = user.username
			const action = await createAction(user._id, ActionType.ACCEPT_REPLY).save()
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
