var errorMessages = require('../error').messages,
  HttpError = require('../error').HttpError,
  async = require('async'),
  userService = require('../services/user'),
  oauthService = require('../services/oauth/oauth'),
  authService = require('../services/Auth/authService'),
  config = require('../config/config'),
  parameters = require('../config/parameters');
  
var private = {
  getUserData : function(userId,expiresAt,clientMongoId,mainCallback){
    async.parallel({
      userInfo : function(callback){
        userService.getInfoById(userId, callback);
      },
      refreshToken : function(callback){
        oauthService.getRefreshToken({ 
          userId: userId, 
          expiresAt: expiresAt,
          id: clientMongoId
        },callback);
        
      }
    },
    function(err,results){
      if(err){
        return mainCallback(err);
      } 
      mainCallback(null,results);
    });
  }
};

module.exports  = {
  
  userInfo:function(req,res,next){
    if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=30');
    if(!req.oauth.bearerToken.userId){
      return next(new HttpError(403,errorMessages['accessDenied']));
    }
    async.waterfall([
      function(callback){
        private.getUserData(req.oauth.bearerToken.userId,+req.oauth.bearerToken.expires/1000,req.oauth.bearerToken.clientMongoId,callback)
      },
      function(results,callback){
        var user = results["userInfo"];
       
        user['access_token'] = {
          'access_token' : req.oauth.bearerToken.accessToken,
          'expires_in' : config.get('security:tokenLife'),
          'expires_at' : +req.oauth.bearerToken.expires/1000,
          'token_type' : "bearer",
          'refresh_token' : results['refreshToken']['token']
        };
        callback(null,user);
      }
    ],function(err,result){
      if(err){
        return next(err);
      }
      
      var userInfo = require('../resources/serializer')("User")
        .setSerializeNull(false)
        .setGroups(["get_auth_user_info"])
        .serialize(result);
        
      if(!!req.query['decrypted']){
        res.setHeader('Content-Type', 'application/json');
        res.end(userInfo);
        return;
      }
      
      var encrypted = authService.encrypt(userInfo);
      res.cookie(parameters.get('cookie_private_data_name'),encrypted, { 
        maxAge: parameters.get('cookie_private_data_expire'), 
        domain:'.'+parameters.get('auth_cookie_domain'),
        httpOnly: true 
      });
            
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(encrypted));
    });

  }   
  
};
