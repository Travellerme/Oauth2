var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    HttpError = require('../error').HttpError,
    AuthError = require('../error').AuthError;

require('./auth/auth');


var log = require('./log')(module);


var app = express();

if(app.get('env') == 'development'){
  app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());
app.use(require('../middleware/sendHttpError.js'));

require('../routes')(app);

app.use(function(err, req, res, next) {
  
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
  
  res.status(err.status);
  
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(e));
    
});

module.exports = app;