var path = require('path');
global.appRoot = path.resolve(__dirname + "/../");
var async = require('async'),
  pg = require('pg'),
  phpUnserialize = require('phpunserialize');
  log = require(appRoot + '/lib/log')(module,'scripts'),
  db = require(appRoot + '/lib/db/mongoose'),
  pgQuery = require(appRoot + '/lib/db/pg'),
  parameters = require(appRoot + '/config/parameters'),
  config = require(appRoot + '/config/config'),
  mongoose = require('mongoose'),
  args = process.argv.slice(2),
  Client = require(appRoot + '/models/client');


var findClients = function(callback){
  log.info('findClients');
  var results = [];
  pgQuery(function(client){
    var query = client.query('SELECT * FROM "oauth_client"');

    query.on('row', function(row) {
        results.push(row);
    });

    query.on('error', function(error) {
      callback(error);
    });

    query.on('end', function() {
      client.end();
      callback(null,results);
    });

  },callback);
  
};

var insertClients = function(clients,mainCallback){
  log.info('insertClients');
  var results = {};
  async.eachLimit(clients, 20, function iterator(data, next){

    // Build a model and save it to the DB, call next when finished
    new Client({
      name:  data['name'],
      randomId: data['id'] + '_' + data['random_id'],
      redirectUris: phpUnserialize(data['redirect_uris']),
      allowedGrantTypes: phpUnserialize(data['allowed_grant_types']),
      secret: data['secret']
    }).save(function(err,model){
      if(err){
        return mainCallback(err);
      }

      results[data['id']] = model;
      next();
    });

  }, function done(err){
    if (err) {
      return mainCallback(err);
    }  

    mainCallback(null,results);

  });
  
};


var copyData = function(){
  async.waterfall([
    findClients,
    function(clients,callback){
      insertClients(clients,function(err,insertedClients){
        if(err){
          return callback(err);
        }
        callback(null);
      });
    }
  ],function(err,result){
    
    if(err){
      log.error(err);
      return process.exit();
    }
    log.info('finish');
    process.exit();

  });
};

if(!args[0] || ["rewrite","add"].indexOf(args[0]) === -1){
  log.info("Options:\n\n"
    + "\"rewrite\": The \"rewrite\" - Oauth Clients will be rewrited by data from postgres\n"
    + "\"add\": The \"add\" - Data from postgres will be added to Oauth Clients\n");
  process.exit();
}


if(args[0] === "rewrite"){
  log.info('Started with "rewrite" option. Oauth Clients will be rewrited');
  Client.remove({},function(err,result){
    if(err){
      log.error(err);
      return process.exit();
    }
    copyData();
  });
  
} 

if(args[0] === "add"){
  log.info('Started with "add" option. Data will be added to Oauth Clients');
  copyData();
}


