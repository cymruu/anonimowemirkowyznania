var config = require('./config.js');
var { Wykop, Client } = require('../wypokjs/dist/index.js');
const wykop = new Wykop(config.wykopConfig);
const client = new Client(wykop, config.wykopClientConfig);
module.exports = client;
