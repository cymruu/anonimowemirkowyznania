var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var archiveSchema = new Schema({
  entry: Object
});

module.exports = mongoose.model('archives', archiveSchema);
