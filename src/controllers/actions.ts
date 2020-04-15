import actionModel from '../models/action'

const actionTypes = {
	0: 'Dodane do bazy',
	1: 'Zaakceptowane i dodane na mikroblog',
	2: 'Oznaczono jako treść niebezpieczna',
	3: 'Oznaczono jako treść bezpieczna',
	4: 'Dodano odpowiedź',
	5: 'Usunięto z wykopu',
	6: 'Dodano komentarz obsługujący powiadomienia o nowych odpowiedziach',
	7: 'Usunięto odpowiedź',
	8: 'Zaakceptowano nową odpowiedź',
	9: 'Zmodyfikowano tagi wpisu',
}

export default function createAction(userId, actionType, note?: string) {
	return new actionModel({
		action: actionTypes[actionType],
		user: userId,
		time: new Date(),
		type: actionType,
		note: note,
	})
}
