var mongoose = require('mongoose'),
  lib = '../../lib/',
  log = require(lib + 'log')(module),
  config = require('../../config/config.js'),
  uri = [(config.get('mongoose:driver')+':/'),config.get('mongoose:host'),config.get('mongoose:db')].join('/');
  
mongoose.connect(uri, config.get('mongoose:options'));

var db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback () {
	log.info("Connected to DB!");
});

module.exports = mongoose;