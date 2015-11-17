var pg = require('pg'),
  config = require(appRoot + '/config/config'),
  log = require(appRoot + '/lib/log')(module,'main'),
  HttpError = require(appRoot + '/error').HttpError,
  conString = "postgres://"+config.get('pg:username')+":"+config.get('pg:password')
    +"@"+config.get('pg:host')
    +"/"+config.get('pg:db');


module.exports = function(callbackSuccess,callbackErr){
  pg.connect(conString,function(err,client,done){
    if(err){ 
      log.error(err);
      callbackErr(new HttpError(500, "Postgres connection was not established"),done);
      return;
    }
    callbackSuccess(client,done);
  });
};
