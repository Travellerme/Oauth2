var oauth2orize = require('oauth2orize'),
  passport = require('passport'),
  AuthError = require('../error').AuthError,
  errorMessages = require('../error').messages,
  async = require('async'),
  requestIp = require('request-ip'),
  ipaddr = require('ipaddr.js'),
  _ = require('underscore'),
  UAParser = require('ua-parser'),
  oauthService = require('../services/oauth'),
  userService = require('../services/user'),
  metricService = require('../services/Metric/metricService'),
  lib = '../lib/',
  config = require('../config/config.js'),
  log = require(lib + 'log')(module),
  db = require(lib + 'db/mongoose'),
  MetricLoginConst = require('../models/metricLogin').const,
  RefreshToken = require('../models/refreshToken'),
  metricLoginFields = require('../models/metricLogin').fields,
  
  // create OAuth 2.0 server
  aserver = oauth2orize.createServer();

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password(function(client, usernameOrEmail, password, scope, done) {

    async.waterfall([
      function(callback) {
        userService.findUserByUsernameOrEmail(usernameOrEmail,callback);
      },
      function(userArr, callback) {

        var user = userArr.length ? userArr[0] : false;
        
        var model = { 
          userId: user.id || false, 
          randomId: client.randomId ,
          client: {
            "$ref":"client",
            "$id":client._id ,
            "$db":config.get('mongoose:db') 
          } 
		};
        
        metricLoginFields.oauthClient = model.client;
        metricLoginFields.type = MetricLoginConst.TYPE_LOGIN;
        metricLoginFields.fromBy = MetricLoginConst.FROM_BY_AZUBU;
        
        
        if (user === false || !userService.checkPassword(user,password)) {
          metricLoginFields.status = MetricLoginConst.STATUS_FAIL;
          metricLoginFields.description = errorMessages['authError']
            +"[ server_error ]  [ username = '"+usernameOrEmail+"' ] [ client_id = '"+client._id+"' ]";
          metricService.writeMetricLogin(metricLoginFields);
          callback(new AuthError(401,errorMessages['authError']));
          return;
        }
        
        metricLoginFields.userId = model.userId;
        metricLoginFields.status = MetricLoginConst.STATUS_SUCCESS;
        
        
        metricService.writeMetricLogin(metricLoginFields);

        oauthService.generateTokens(model, done);

      }
    ], function (err, result) {
      if(err){  
        log.error(err);  
        done(err);
      }
      
    });
    
}));

aserver.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
  
    var model = { 
      userId: null, 
      randomId: client.randomId ,
      client: {
        "$ref":"client",
        "$id":client._id ,
        "$db":config.get('mongoose:db') 
      } 
    };
    oauthService.generateTokens(model, done);
  
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

  async.waterfall([
      function(callback) {
        RefreshToken.findOne({ token: refreshToken, 'client.$id': client._id },'token userId',callback);
      },
      function(token, callback) {
        if (!token) { 
          return done(null, false); 
		}
        callback(null,token);
      },function(token, callback){
        userService.findUserById(token.userId, callback);
      },function(userArr, callback){
        var user = userArr.length ? userArr[0] : false;
        if(user === false){
          return done(null, false); 
        }
        callback(null,user);
      },function(user, callback){  
        oauthService.modifyRefreshToken(refreshToken,client._id, user, callback);
      },function(user, callback){  
        
        var model = { 
          userId: user.id, 
          clientId: client.randomId,
          client: {
            "$ref":"client",
            "$id":client._id ,
            "$db":config.get('mongoose:db') 
          } 
        };
        
        oauthService.generateTokens(model, done);
      }
    ], function (err, result) {
      if(err){  
        log.error(err);  
        done(err);
      }
      
    });
  
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    function(req,res,next){
      var clientIpFull = requestIp.getClientIp(req),
        clientIpArr = clientIpFull.split(':'),
        clientIp = clientIpArr[clientIpArr.length-1];
            
      if(_.isEqual(ipaddr.process(clientIpFull), ipaddr.process(clientIp)) === true){
        clientIpFull = clientIp;
      }

      metricLoginFields.httpRemoteAddr = clientIpFull;

      //metricLoginFields.httpUserAgent = req.headers['user-agent'];
      
      var parser = UAParser.parse(req.headers['user-agent']);
      metricLoginFields.userBrowser = parser.ua.toString() || null;
      metricLoginFields.userOs = parser.os.toString();
      metricLoginFields.userAgent = req.headers['user-agent'];
      

      next();
    },
	passport.authenticate(['oauth2-client-password'], { session: false, failureRedirect: '/authError' }),
	aserver.token(),
	aserver.errorHandler(),
];
