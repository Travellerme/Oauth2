var express = require('express'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  expressErrorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  config = require(appRoot + '/config/config'),
  parameters = require(appRoot + '/config/parameters'),
  oauthserver = require('oauth2-server'),
  HttpError = require(appRoot + '/error').HttpError,
  AuthError = require(appRoot + '/error').AuthError,
  log = require(appRoot + '/lib/log')(module,'main'),
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
  model: require(appRoot + '/lib/auth/oauth2server'),
  grants: parameters.get('allowedGrandTypes'),
  debug: true,
  clientIdRegex:/.*/,
  passthroughErrors:true,
  continueAfterResponse:true,
  accessTokenLifetime:config.get('security:tokenLife'),
  refreshTokenLifetime:config.get('security:tokenLife') 
});

require(appRoot + '/resources/routes')(app);

app.use(app.oauth.errorHandler());


app.use(require(appRoot + "/middleware/errorHandler"));


module.exports = app;