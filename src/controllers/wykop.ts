import { service } from '../wykop'
import bodyBuildier from '../controllers/bodyBuildier'
import { createAction, ActionType } from '../controllers/actions'
import archiveModel from '../models/archive'
import logger from '../logger'
import { CommentUpvoter } from 'wypokjs/dist/models/Upvoter'
import { IConfession } from '../models/confession'
import { IReply } from 'src/models/reply'
import { IUser } from 'src/models/user'

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
		return archive.save().then(() => {
			return service.Entries.Delete(entryToDelete.id)
		})
	})
}

export const deleteEntryComment = (entryCommentId) => {
	return service.Entries.Comment(entryCommentId).then(comment => {
		const archive = new archiveModel()
		archive.item = comment
		return archive.save().then(() => {
			return service.Entries.CommentDelete(entryCommentId)
		})
	})
}

export const sendPrivateMessage = (receiver, body) => service.Pm.SendMessage(receiver, body)

export const acceptConfession = (confession: IConfession, entryBody: string, adultmedia: boolean = false) => {
	return service.Entries.Add({ body: entryBody, embed: confession.embed, adultmedia })
}

export const addNotificationComment = function(confession, user) {
	return service.Entries.CommentAdd(confession.entryID, { body: bodyBuildier.getNotificationCommentBody(confession) })
		.then(async (response) => {
			confession.notificationCommentId = response.id
			const action = await createAction(user._id, ActionType.ADD_NOTIFICATION_COMMENT).save()
			confession.actions.push(action)
			return confession.save()
		})
}

export const acceptReply = async (reply: IReply, user: IUser) => {
	let entryBody = bodyBuildier.getCommentBody(reply, user)
	const entryFollowers = await getFollowers(reply.parentID.notificationCommentId)
	if (entryFollowers.length > 0) {
		if (entryFollowers.length > 0) {
			entryBody += `\n! Wołam obserwujących: ${entryFollowers.map(x => `@${x.author.login}`).join(', ')}`
		}
	}
	return service.Entries.CommentAdd(
		reply.parentID.entryID, { body: entryBody, embed: reply.embed },
	).then(async (response) => {
		reply.commentID = response.id
		reply.status = 1
		reply.addedBy = user.username
		const action = await createAction(user._id, ActionType.ACCEPT_REPLY).save()
		reply.parentID.actions.push(action)

		return Promise.all([reply.parentID.save(), reply.save()]).then(_ => reply)
	})
}
