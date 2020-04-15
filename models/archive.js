var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var archiveSchema = new Schema({
  item: Object
});

module.exports = mongoose.model('archives', archiveSchema);
