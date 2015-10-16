var nconf = require('nconf');
var path = require('path');

nconf.argv()
  .env()
  .file('params',{ file: path.join(__dirname, 'parameters.json') });

module.exports = nconf;