var actionModel = require('../models/action.js');
var actionTypes = {
  0: 'Dodane do bazy',
  1: 'Zaakceptowane i dodane na mikroblog',
  2: 'Oznaczono jako treść niebezpieczna',
  3: 'Oznaczono jako treść bezpieczna',
  4: 'Dodano odpowiedź',
  5: 'Usunięto z wykopu', //TODO
  6: 'Tag #anonimowemirkowyznania usunięty',
  7: 'Tag #anonimowemirkowyznania dodany',
  8: 'Zaakceptowano nową odpowiedź'
}
function createAction(userId, actionType, cb){
  var action = new actionModel();
  action.action = actionTypes[actionType];
  action.user = userId;
  action.time = new Date();
  action.type = actionType; //dupliacted data!
  action.save((err, action)=>{
    cb(err, action._id);
  });
}
module.exports = createAction;
