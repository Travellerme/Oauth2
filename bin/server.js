var path = require('path');
global.appRoot = path.resolve(__dirname + "/../");
var debug = require('debug')('restapi'),
  config = require(appRoot + '/config/config.js'),
  log = require(appRoot + '/lib/log')(module,'main'),
  app = require(appRoot + '/lib/app'),
  fs = require('fs'),
  async = require('async'),
  stats = null,
  createServer = function(callback){
    callback = callback || function(){};
    var listenCallback = function() {
      debug('Express server listening on ' + config.get('portOrSocket'));
      log.info('Express server listening on port ' + config.get('portOrSocket'));
      callback();
    };
    
    if(isNaN(+config.get('portOrSocket'))){
      app.listen(config.get('portOrSocket'), listenCallback);
    } else {
      app.listen(config.get('portOrSocket'),config.get('host'), listenCallback);
    }
    
  };

if(isNaN(+config.get('portOrSocket'))){
    async.waterfall([
      function(callback){
        fs.lstat(config.get('portOrSocket'),function(err,stats){
          if(!!stats){
            return callback(null);
          }
          return callback(true);
        });
        
      },
      function(callback){
        fs.unlink(config.get('portOrSocket'),callback);
      },
      createServer,
      function(callback){
        fs.chmod(config.get('portOrSocket'), config.get('grantsSocketFile'), callback)
      }
    ],function(err,result){
      if(err === true){
        return createServer(function(){
          fs.chmod(config.get('portOrSocket'), config.get('grantsSocketFile'));
        });
      }
      if(err){
        return log.error(err);
      }

    });
} else {
  createServer();
}
