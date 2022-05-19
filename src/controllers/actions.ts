import actionModel from '../models/action'

export enum ActionType {
	NEW_ENTRY = 0,
	ACCEPT_ENTRY,
	DECLINE_ENTRY,
	REVERT_ENTRY_DECLINE,
	NEW_REPLY,
	DELETE_ENTRY,
	ADD_NOTIFICATION_COMMENT,
	DELETE_REPLY,
	ACCEPT_REPLY,
	UPDATED_TAGS,
	REPLY_CHANGE_STATUS,
}

const actionTypes = {
	[ActionType.NEW_ENTRY]: 'Dodane do bazy',
	[ActionType.ACCEPT_ENTRY]: 'Zaakceptowane i dodane na mikroblog',
	[ActionType.DECLINE_ENTRY]: 'Zmieniono status na: odrzucone',
	[ActionType.REVERT_ENTRY_DECLINE]: 'Zmieniono status na: oczekujące',
	[ActionType.NEW_REPLY]: 'Dodano anonimową odpowiedź',
	[ActionType.DELETE_ENTRY]: 'Usunięto z wykopu',
	// eslint-disable-next-line max-len
	[ActionType.ADD_NOTIFICATION_COMMENT]: 'Dodano komentarz obsługujący powiadomienia o nowych odpowiedziach', //deprecated
	[ActionType.DELETE_REPLY]: 'Usunięto odpowiedź',
	[ActionType.ACCEPT_REPLY]: 'Zaakceptowano nową odpowiedź',
	[ActionType.UPDATED_TAGS]: 'Zmodyfikowano tagi wpisu',
	[ActionType.REPLY_CHANGE_STATUS]: 'Zmieniono status odpowiedzi',
}

export function createAction(userId: string, actionType: ActionType, note?: string) {
	//TODO: returned action should contain user: {username} so it can be displayed on frontend
	return new actionModel({
		action: actionTypes[actionType],
		user: userId,
		time: new Date(),
		type: actionType,
		note,
	})
}
