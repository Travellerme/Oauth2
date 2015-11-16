var HttpError = require('../error').HttpError,
    AuthError = require('../error').AuthError,
    errorMessages = require('../error').messages,
    errorCodes = require('../error').codes,
    log = require('../lib/log')(module,'main'),
    OAuth2Error = require('oauth2-server/lib/error');

module.exports = function(err, req, res, next) {

  if(err instanceof OAuth2Error){
    
    delete err.name;
    if(!!errorMessages[err.message]){
      err.error_description = errorMessages[err.message];
      err.code = errorCodes[err.message] || 400;
      
    }
    if([503,500].indexOf(err.code) > -1 && !errorMessages[err.message]){
      err.error_description = "server_error";
    }
    delete err.message;

    delete err.stack;

    if (err.headers) res.set(err.headers);
    delete err.headers;
    
    if(!res._headerSent){
      return res.status(err.code).send(err);
    }
    return;
  }
    
    
  
  if (typeof err == 'number') {
    err = new HttpError(err);
  }
  
  if (!(err instanceof HttpError) && !(err instanceof AuthError)) {
    err = new HttpError(500);
    log.error(err);    
  } 
  if(err.status == 500){
    log.error('%s %d %s', req.method, res.statusCode, err.message);
  }else{
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
  }
  var e = {};
  
  e.error = err.code || 'server_error';
  if (err.message) { e.error_description = err.message; }
  
  res.status(err.code || err.status);
  
  if(!res._headerSent){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(e));
  }
    
}