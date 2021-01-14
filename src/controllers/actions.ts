import actionModel from '../models/action'

const actionTypes = {
	0: 'Dodane do bazy',
	1: 'Zaakceptowane i dodane na mikroblog',
	2: 'Zmieniono status na: odrzucone',
	3: 'Zmieniono status na: oczekujące',
	4: 'Dodano anonimową odpowiedź',
	5: 'Usunięto z wykopu',
	6: 'Dodano komentarz obsługujący powiadomienia o nowych odpowiedziach', //deprecated
	7: 'Usunięto odpowiedź',
	8: 'Zaakceptowano nową odpowiedź',
	9: 'Zmodyfikowano tagi wpisu',
	10: 'Zmieniono status odpowiedzi',
}

export enum ActionType {
	NEW_ENTRY = 0,
	ACCEPT_ENTRY,
	DECLINE,
	REVERT_DECLINE,
	NEW_REPLY,
	DELETE_ENTRY,
	ADD_NOTIFICATION_COMMENT,
	DELETE_REPLY,
	ACCEPT_REPLY,
	UPDATED_TAGS,
	REPLY_CHANGE_STATUS,
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
