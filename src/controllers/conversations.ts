import conversationModel from '../models/conversation'
import * as wykopController from '../controllers/wykop'
import config from '../config'
export function createNewConversation(parentObject, cb) {
	let userFlag: boolean
	const conversation = new conversationModel()
	if ('username' in parentObject) {
		conversation.userID = parentObject._id
		userFlag = true
	} else {
		conversation.parentID = parentObject._id
	}
	conversation.save((err, conversation) => {
		if (err) { return cb(err) }
		if (!userFlag) {
			parentObject.conversations.push(conversation._id)
			parentObject.save((err) => {
				if (err) { return cb(err) }
				cb(null, conversation._id)
			})
		} else {
			//TODO: handle response
			wykopController.sendPrivateMessage(
				parentObject.username,
				`Nowa wiadomość na anonimowychmirkowyznaniach ${config.siteURL}/admin/messages`,
			).then()
			return cb(null, conversation._id)
		}
	})
}
export function validateAuth(conversationId, auth, cb) {
	conversationModel.findOne({ _id: conversationId }).populate('parentID', 'auth').exec((err, conversation) => {
		if (err) { return cb(err) }
		if (!conversation) {
			return cb('nie odnaleziono konwersacji')
		} //this returns string because validateAuth function result is sent in chat msg
		if (typeof conversation.userID !== 'undefined' && conversation.userID._id === auth) {
			return cb(null, true)
		}
		if (typeof conversation.parentID !== 'undefined' && conversation.parentID.auth === auth) {
			return cb(null, true)
		}
		cb(null, false)
	})
}
export function getConversation(conversationId, auth, cb) {
	conversationModel.findOne({ _id: conversationId })
		.populate([{ path: 'parentID', select: 'auth' }, { path: 'userID', select: '_id username' }])
		.exec((err, conversation) => {
			if (err) { return cb(err) }
			if (!conversation) {
				return cb('nie odnaleziono konwersacji')
			}
			if (typeof conversation.userID !== 'undefined' && auth && conversation.userID._id === auth.substr(2)) {
				conversation.auth = conversation.userID._id
			}
			if (typeof conversation.parentID !== 'undefined' && conversation.parentID.auth === auth) {
				conversation.auth = conversation.parentID.auth
			}
			return cb(err, conversation)
		})
}
export function newMessage(conversationId, auth, text, IPAdress, cb) {
	conversationModel.findOne({ _id: conversationId }, { '_id': 1, 'parentID': 1, 'userID': 1 })
		.populate([{ path: 'parentID', select: 'auth' }, { path: 'userID', select: '_id username' }])
		.exec((err, conversation) => {
			if (err) { return cb(err) }
			if (!text) { return cb('wpisz tresc wiadomosci') }
			if (!conversation) { return cb('nie odnaleziono konwersacji') }
			let isOP = false
			let userObject = null
			if (typeof conversation.userID !== 'undefined' && conversation.userID._id === auth) {
				isOP = true
				userObject = conversation.userID._id
			}
			if (typeof conversation.parentID !== 'undefined' && conversation.parentID.auth === auth) {
				isOP = true
			}
			conversationModel.findOneAndUpdate(conversationId,
				{ $push:
					{ messages: { time: new Date(), text: text, IPAdress: IPAdress, OP: isOP, user: userObject } },
				},
				{}, (err) => {
					if (err) { return cb(err) }
					cb(null, isOP)
				})
		})
}
