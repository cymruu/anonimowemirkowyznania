var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conversationSchema = new Schema({
    messages: [{time: Date, text: String, IPAdress: {type: String, trim:true}, OP: {type: Boolean, default: false}}],
    parentID: {type: Schema.Types.ObjectId, ref: 'confessions'}
});

module.exports = mongoose.model('conversations', conversationSchema);
