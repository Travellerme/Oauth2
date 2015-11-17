var mongoose = require('mongoose'),
  log = require(appRoot + '/lib/log')(module,'main'),
  config = require(appRoot + '/config/config.js'),
  replica = config.get('mongoose:replica'),
  hostAndPort = config.get('mongoose:host') + ":" + config.get('mongoose:port'),
  options = config.get('mongoose:options'),
  prepareUri = [(config.get('mongoose:driver')+':/')];

if(!!config.get('mongoose:user')){
  prepareUri.push(config.get('mongoose:user') + ":" + config.get('mongoose:password') + "@" + hostAndPort);
} else {
  prepareUri.push(hostAndPort);
}

var uri = prepareUri.join("/");

if(!!replica && Array.isArray(replica) && replica.length){
  uri += "," + replica.map(function(val){
    return val['host'] + ":" + val['port'];
  }).join(",");
} else {
  delete options['replset'];
}

uri += "/" + config.get('mongoose:db')

mongoose.connect(uri, options);

var db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback () {
	log.info("Connected to DB!");
});

module.exports = mongoose;