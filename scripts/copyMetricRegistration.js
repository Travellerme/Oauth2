var lib = '../lib/',
  async = require('async'),
  Cursor = require('pg-cursor'),
  pg = require('pg'),
  log = require(lib + 'log')(module,'scripts'),
  db = require(lib + 'db/mongoose'),
  pgQuery = require(lib + 'db/pg'),
  util = require('util'),
  parameters = require('../config/parameters'),
  config = require('../config/config'),
  mongoose = require('mongoose'),
  args = process.argv.slice(2),
  Client = require('../models/client'),
  UserAgent = require('../models/userAgent'),
  MetricRegistration = require('../models/metricRegistration').MetricRegistration;


var findClients = function(callback){
  log.info('findClients');
  var results = {};
  Client.find({}, function(err, clients) {
    if(err){
      return callback(err);
    }
    for (var i = 0; i < clients.length; ++i)
      results[clients[i]['name']] = clients[i];
    
    callback(null,results)
  })
  
};

var findUserAgents = function(callback){
  log.info('findUserAgents');
  var results = {};
  UserAgent.find({}, function(err, userAgents) {
    if(err){
      return callback(err);
    }
     
    for (var i = 0; i < userAgents.length; ++i)
      results[userAgents[i]['hash']] = userAgents[i];
    
    callback(null,results)
  })
};

var updateMetric = function(userAgent,clients,metricCount,mainCallback){
  log.info('updateMetric');
  var rowsPerIterate = 100,
    count = Math.ceil(metricCount/rowsPerIterate),
    readCursor = function(cursor,callback){
      

      log.info("Memory usage: "+util.inspect(process.memoryUsage()));
      
      cursor.read(rowsPerIterate, function(err, rows) {
        if(err) {
          return mainCallback(err)
        }

        if(!rows.length) return mainCallback();
        
        
        insertMetric(rows,clients,userAgent,function(err){
          if(err){
            return mainCallback(err)
          }
          rows = null;  //clear memory
          callback();
        });

       
      });
    };
    
     
  pgQuery(function(client){
    var cursor = client.query(new Cursor('SELECT m.*,u.email,u.username,c.name as clientName,h.hash FROM "metric_registration" m '
      +' LEFT JOIN "user" u on m.user_id=u.id'
      +' LEFT JOIN "oauth_client" c on m.oauth_client_id=c.id'
      +' LEFT JOIN "http_user_agent" h on m.http_user_agent_id=h.id'
      )),
      countArr = new Array(count);
      
    for (var i = countArr.length; i >= 0; i--)
      countArr[i] = i;

  
    async.eachLimit(countArr, 1, function iterator(i, next){
       // Build a model and save it to the DB, call next when finished

        readCursor(cursor,next);

    }, function done(err, results){
      if (err) { // When an error has occurred while trying to save any model to the DB
        return mainCallback(err);
      }
      return mainCallback();
    });
  

  },mainCallback);
};

var insertMetric = function(metrics,userAgent,clients,mainCallback){
  log.info('insertMetric');
 
  async.eachLimit(metrics, 20, function iterator(data, next){

    try{
      new MetricRegistration({
        userId:  data["user_id"],
        oauthClient: ((!!data['clientname'] && !!clients && !!clients[data['clientname']] && !!clients[data['clientname']]._id) ?
          {
            "$db":config.get('mongoose:db'),
            "$id":clients[data['clientname']]._id,
            "$ref":"client"
          } : null),
        httpUserAgent: ((!!data['hash'] && !!userAgent && !!userAgent[data['hash']] && !!userAgent[data['hash']]._id) ?
          {
            "$db":config.get('mongoose:db'),
            "$id":userAgent[data['hash']]._id,
            "$ref":"userAgent"
          } : null),
        country: {},
        type: data['type'],
        fromBy: data['from_by'],
        socialServiceType:data['social_service_type'],
        email:data['email'],
        username:data['username'],
        httpRemoteAddr:data['http_remote_addr'],
        status:data['status'],
        created:data['created_at'],
        description:data['description']

      }).save(function(err,model){

        if(err){
          return next(err);
        }

        return next();

      });

    }catch(e){
      console.log("err",e);
      console.log("data",data);
      console.log("clients",clients[data['clientName']]);
      console.log("userAgent",userAgent[data['hash']]);
    }
   
    


  }, function done(err){
    if (err) {
      return mainCallback(err);
    }  
    
    metrics = null;
    
    mainCallback(null);

  });
}

var getCountMetric = function(callback){
  log.info('getCountMetric');
  var results = [];
  pgQuery(function(client){
    var query = client.query('SELECT count(*) FROM "metric_registration"');

    query.on('row', function(row) {
        results.push(row);
    });

    query.on('error', function(error) {
      callback(error);
    });

    query.on('end', function() {
      client.end();
      callback(null,results[0]['count']);
    });

  },callback);
};

var copyData = function(){
  async.waterfall([
    findClients,
    function(clients,callback){
      findUserAgents(function(err,userAgents){
        if(err){
          return callback(err);
        }
        return callback(null,clients,userAgents);
      });
    },
    function(userAgents,clients,callback){
      getCountMetric(function(err,count){
        if(err){
          return callback(err);
        }
        callback(null,userAgents,clients,count);
      });
    },
    function(userAgents,clients,metricCount,callback){     
      updateMetric(userAgents,clients,metricCount,function(err,count){
        if(err){
          return callback(err);
        }
        callback(null,userAgents,clients,count);
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
    + "\"rewrite\": The \"rewrite\" - MetricRegistration will be rewrited by data from postgres\n"
    + "\"add\": The \"add\" - Data from postgres will be added to MetricRegistration\n");
  process.exit();
}


if(args[0] === "rewrite"){
  log.info('Started with "rewrite" option. MetricRegistration will be rewrited');
  MetricRegistration.remove({},function(err,result){
    if(err){
      log.error(err);
      return process.exit();
    }
    copyData();
  });
  
} 

if(args[0] === "add"){
  log.info('Started with "add" option. Data will be added to MetricRegistration');
  copyData();
}

