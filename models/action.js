var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var actionSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: 'users' },
  action: String,
  type: Number,
  time: Date
});

module.exports = mongoose.model('actions', actionSchema);

/**
 * napisac usuwanie i logowanie, zeby bylo wiadomo, kto co i kiedy usuwa i ogolnie robi
 * najlepiej w jakims kontrolerze do ogarniania logow ogolnie
 * type: 0 - logowanie, 2 dodawanie na mirko, 3 usuwanie ! ale to juz w jakims osoobnym pliku ustawic
 *
 */
