var AccessToken = require('../../models/accessToken'),
  RefreshToken = require('../../models/refreshToken'),
  AuthError = require('../../error').AuthError,
  errorMessages = require('../../error').messages,
  userService = require('../user'),
  OAuth2 = require('oauth').OAuth2,
  crypto = require('crypto'),
  async = require('async'),
  config = require('../../config/config'),
  parameters = require('../../config/parameters'),
  log = require('../../lib/log')(module,'main');

var private = {
  // Generic error handler
  errFn : function (cb, err, result) {
    if (err) { 
        return cb(err); 
    }
    return cb(null,result);
  },
  getFacebookUserInfo : function(params,callback){
    var oauth2 = new OAuth2(parameters.get("social_services:configuration:facebook:appId"),
      parameters.get("social_services:configuration:facebook:secret"),
      "", parameters.get("social_services:configuration:facebook:oauth"),
      parameters.get("social_services:configuration:facebook:graph")+"/oauth/access_token",
      null);

    oauth2.get(parameters.get("social_services:configuration:facebook:graph")+"/me", params["social_service_token"] , callback);
  },
  authBySocial : function(params,oauthCallback){
      if(!this.isAllowedSocialService(params['social_service_name'] || null)){
        return oauthCallback(new AuthError(401,'invalidSocialService'));
      }
      var serviceName = params['social_service_name'],
        userInfo = "get"+(serviceName.charAt(0).toUpperCase() + serviceName.slice(1))+"UserInfo",
        userById = "getUserBy"+(serviceName.charAt(0).toUpperCase() + serviceName.slice(1))+"Id";
      
      async.waterfall([
        function(callback){
          private[userInfo](params,callback);
        },
        function(data ,response,callback) {
          var userInfo = JSON.parse(data);
          if(!userInfo['id'] || !userInfo['name'] || !userInfo['email']){
            return oauthCallback(new AuthError(403,'socialServiceAccessDenied'));
          }
          callback(null,{
            'id' : userInfo['id'], 
            'account' : userInfo['name'],
            'email' : userInfo['email']
          });
        },
        function(userData,callback){
          userService[userById](userData['id'],callback);
        },
        function(userArr, callback) {
          var user = userArr.length ? userArr[0] : false;
          if(!user || !user.id){
            return oauthCallback(new AuthError(401,'authError'));
          }
          oauthCallback(null,true,{id:user.id,user:user,type:'social'});
        }
      ],function(err,result){
        if(err){
          log.error(err);
          return oauthCallback(err);
        }
      });
  },
  isAllowedSocialService : function(serviceName){
    return !!serviceName && JSON.parse(parameters.get("social_services:available")).indexOf(serviceName) > -1;
  },
  authAdminOrPremium : function(params,oauthCallback,type){

    if((!params.username || !params.password) && type !== "userId"){
      return oauthCallback(new AuthError(401,'missingOauthParams'));
    }
    
    if(!params.userId && type === "userId"){
      return oauthCallback(new AuthError(401,'missingOauthUserIdParams'));
    }
    
    async.waterfall([
      function(callback) {
        switch(type){
          case "premium-broadcaster":
            return userService.findOneUserPremiumBroadcasterByUsernameOrEmail(params.username,callback);
          case "userId":
            return userService.findUserById(params.userId,callback);
          case "admin":
            return userService.findOneUserAdminByUsernameOrEmail(params.username,callback);
        }
        return oauthCallback(null,false);
      },
      function(userArr, callback) {
        var user = userArr.length ? userArr[0] : false;
        if(!user || !user.id){
          return oauthCallback(new AuthError(401,'authError'));
        }
        
        oauthCallback(null,true,{id:user.id,password:params.password,usernameOrEmail:params.username,user:user,type:((type !== "userId")?'accessToken':type)});
      }
    ], function (err, result) {
      if(err){  
        log.error(err);  
        oauthCallback(err);
      }
      
    });
    
  }
  
};

module.exports = {
  getRefreshToken : function(data,callback){
    RefreshToken
      .where('userId').equals(data['userId'])
      .where('client.$id').equals(data['id'])
      .where('expiresAt').gte(data['expiresAt'])
      .sort('-expiresAt')
      .limit(1)
      .exec(callback);
            
  },
  authViaCustomGrandTypes:function(grantType, req, oauthCallback){
    
    if(!parameters.get('allowedGrandTypes') || parameters.get('allowedGrandTypes').indexOf(grantType) === -1){
      return oauthCallback(null,false);
    }
    
    var currentTypeArr = grantType.split("/"),
      currentType = currentTypeArr[currentTypeArr.length-1];

    switch(currentType){
      case "premium-broadcaster":
      case "userId":
      case "admin":
        return private.authAdminOrPremium(req.body,oauthCallback,currentType);
      case "localhost.com":
        return private.authBySocial(req.body,oauthCallback);
      default:
        oauthCallback(null,false);
    }
  },
  modifyRefreshToken : function (refreshToken,clientId, user, callback) {
    var oneDay = 86400;
    RefreshToken.update({ token: refreshToken,'client.$id': clientId }, { $set: { expiresAt: +(+new Date()/1000 + oneDay).toFixed() }},{safe:true},function(err,raw){
        if(err){ 
          callback(err);
          return;
        }
        callback(null,user);
    });

  },
  generateToken : function (data,tokenValue,type,done) {
    var errorHandler = private.errFn.bind(undefined, done), 
      token;

    data.token = tokenValue;

    if(type=="refreshToken"){
      token = new RefreshToken(data);
      return token.save(errorHandler);
    }
    if(type=="accessToken"){
      token = new AccessToken(data);
      return token.save(errorHandler);
    }


    done(new Error("invalid token type"));
  }
};


