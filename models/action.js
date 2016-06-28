var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var actionSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: 'users' },
  action: String,
  type: Number,
  time: Date
});

module.exports = mongoose.model('actions', actionSchema);
