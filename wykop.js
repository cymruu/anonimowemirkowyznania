var config = require('./config.js');
var Wykop = require('wykop-es6-2');
var wykop = new Wykop(config.wykop.key, config.wykop.secret, {ssl: true});
module.exports = wykop;
