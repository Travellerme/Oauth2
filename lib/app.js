var express = require('express'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  expressErrorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  config = require('../config/config.js'),
  parameters = require('../config/parameters.js'),
  oauthserver = require('oauth2-server'),
  HttpError = require('../error').HttpError,
  AuthError = require('../error').AuthError,
  log = require('./log')(module,'main'),
  app = express();

if(app.get('env') == 'development'){
  app.use(morgan('dev'));
}
app.set('strict routing', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());

app.oauth = oauthserver({
  model: require('./auth/oauth2server'),
  grants: parameters.get('allowedGrandTypes'),
  debug: true,
  clientIdRegex:/.*/,
  passthroughErrors:true,
  continueAfterResponse:true,
  accessTokenLifetime:config.get('security:tokenLife'),
  refreshTokenLifetime:config.get('security:tokenLife') 
});

require('../resources/routes')(app);

app.use(app.oauth.errorHandler());


app.use(require("../middleware/errorHandler"));


module.exports = app;