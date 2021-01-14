import { service } from '../wykop'
import bodyBuildier from '../controllers/bodyBuildier'
import { createAction, ActionType } from '../controllers/actions'
import archiveModel from '../models/archive'
import logger from '../logger'
import { CommentUpvoter } from 'wypokjs/dist/models/Upvoter'
import { ConfessionStatus, IConfession } from '../models/confession'
import { IReply } from 'src/models/reply'
import { IUser } from 'src/models/user'


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

export const acceptConfession = (entryBody: string, embed, adultmedia: boolean = false) => {
	return service.Entries.Add({ body: entryBody, embed, adultmedia })
}

export const acceptReply = async (reply: IReply, user: IUser) => {
	const entryBody = bodyBuildier.getCommentBody(reply, user)
	return service.Entries.CommentAdd(
		reply.parentID.entryID, { body: entryBody, embed: reply.embed },
	)
}

export const acceptReplyAndCreateAction = async (reply: IReply, user: IUser) => {
	return acceptReply(reply, user)
		.then(async (response) => {
			reply.commentID = response.id
			reply.status = ConfessionStatus.ACCEPTED
			reply.addedBy = user.username
			const action = await createAction(user._id, ActionType.ACCEPT_REPLY).save()
			reply.parentID.actions.push(action)
			return Promise.all([reply.parentID.save(), reply.save()]).then(_ => reply)
		})
}
