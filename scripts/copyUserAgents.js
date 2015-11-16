var lib = '../lib/',
  async = require('async'),
  pg = require('pg'),
  log = require(lib + 'log')(module,'scripts'),
  db = require(lib + 'db/mongoose'),
  pgQuery = require(lib + 'db/pg'),
  parameters = require('../config/parameters'),
  config = require('../config/config'),
  mongoose = require('mongoose'),
  args = process.argv.slice(2),
  UserAgent = require('../models/userAgent');



var findUserAgents = function(callback){
  log.info('findUserAgents');
  var results = [];
  pgQuery(function(client){
    var query = client.query('SELECT * FROM "http_user_agent"');

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


var insertUserAgents = function(userAgents,mainCallback){
  log.info('insertUserAgents');
  var results = {};
  async.eachLimit(userAgents, 20, function iterator(data, next){
    // Build a model and save it to the DB, call next when finished
    new UserAgent({
      hash:  data['hash'],
      userBrowser: data['user_browser'],
      userOs: data['user_os'],
      description: data['description']
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
}



var copyData = function(){
  async.waterfall([
    findUserAgents,
    function(userAgents,callback){
      insertUserAgents(userAgents,function(err,insertedAgents){
        if(err){
          return callback(err);
        }
        callback(null,insertedAgents);
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
    + "\"rewrite\": The \"rewrite\" - UserAgent will be rewrited by data from postgres\n"
    + "\"add\": The \"add\" - Data from postgres will be added to UserAgent\n");
  process.exit();
}


if(args[0] === "rewrite"){
  log.info('Started with "rewrite" option. UserAgent will be rewrited');
  UserAgent.remove({},function(err,result){
    if(err){
      log.error(err);
      return process.exit();
    }
    copyData();
  });
  
} 

if(args[0] === "add"){
  log.info('Started with "add" option. Data will be added to UserAgent');
  copyData();
}


