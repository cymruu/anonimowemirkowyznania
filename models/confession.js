var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var confessionSchema = new Schema({
    text: String,
    embed: String,
    auth: String,
    entryID: Number,
    status: {type: Number, default: 0},
    addedBy: String,
    notificationCommentId: Number,
    IPAdress: String
});

module.exports = mongoose.model('confessions', confessionSchema);
