var nconf = require('nconf');
var path = require('path');

nconf.argv()
  .env()
  .file('config',{ file: path.join(__dirname, 'config.json') });

module.exports = nconf;