var debug = require('debug')('restapi');

var lib = './../lib/';
var config = require('../config/config.js');
var log = require(lib + 'log')(module);
var app = require(lib + 'app');

app.set('port', process.env.PORT || config.get('port') || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + app.get('port'));
  log.info('Express server listening on port ' + app.get('port'));
});
