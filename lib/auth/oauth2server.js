var async = require('async'),
  AuthError = require(appRoot + '/error').AuthError,
  errorMessages = require(appRoot + '/error').messages,
  config = require(appRoot + '/config/config'),
  parameters = require(appRoot + '/config/parameters'),
  log = require(appRoot + '/lib/log')(module,'main'),
  db = require(appRoot + '/lib/db/mongoose'),
  RefreshToken = require(appRoot + '/models/refreshToken'),
  AccessToken = require(appRoot + '/models/accessToken'),
  Client = require(appRoot + '/models/client'),
  userService = require(appRoot + '/services/user'),
  oauthService = require(appRoot + '/services/oauth/oauth'),
  Oauth2 = function(createInstance){
    if(!createInstance) return Object.getPrototypeOf(new Oauth2(true));
    this.clientInfo = null;
    this.accessToken = null;
    this.res = null;
  };
  
Oauth2.prototype.setClientInfo = function(clientInfo){
  this.clientInfo = clientInfo;
};
Oauth2.prototype.getClientInfo = function(){
  return this.clientInfo;
};
Oauth2.prototype.setAccessToken = function(accessToken){
  this.accessToken = accessToken;
};
Oauth2.prototype.getAccessToken = function(){
  return this.accessToken;
};
Oauth2.prototype.setResObject = function(res){
  this.res = res;
};
Oauth2.prototype.getResObject = function(){
  return this.res;
};

var private = new Oauth2();

module.exports.setResponse = function(req, res, next){
  private.setResObject(res);
  next();
}


module.exports.getUserFromClient  = function (clientId, clientSecret, callback) {
    callback(null,{user:{id:null}});
};
module.exports.getAccessToken = function (accessToken, callbackToken) {

  async.waterfall([
    function(callback){
       AccessToken.findOne({ token: accessToken },function(err,token){
        if (err || !token) 
          return callbackToken(err,!!token);
        
        return callback(null,token);
       });
    },
    function(token,callback){
     
      Client.findOne({ _id: token.client.oid }, function(err, client) {
        if(err || !client){
          return callbackToken(err || false);
        }
        callback(null,token,client)
      })
      
      
    },
    function(token,client,callback){

       return callbackToken(null, {
        accessToken: token.token,
        clientId: client.randomId,
        clientSecret: client.secret,
        clientMongoId: client._id,
        expires: new Date(token.expiresAt*1000),
        userId: token.userId
      });
    }
    
  ],function(err,result){
    if(err){  
      log.error(err);  
      callbackToken(err);
    }
  });
  
};

module.exports.getClient = function (clientId, clientSecret, callback) {

  Client.findOne({ randomId: clientId }, function(err, client) {
      if (err || !client) { 
          return callback(err,!!client); 
      }

      if (client.secret !== clientSecret) { 
          return callback(); 
      }
      private.setClientInfo(client);
      callback(null, {
        clientId: client.randomId,
        clientSecret: client.secret,
        clientMongoId: client._id,
      });

  });

};

module.exports.getRefreshToken = function (refreshToken, callbackToken) {

  var tokenData = null;
  async.waterfall([
    function(callback) {
      RefreshToken.findOne({ token: refreshToken, 'client.$id': private.getClientInfo()._id },callback);
    },
    function(token, callback){
      if(!token){
        return callbackToken(null,false);
      }
      tokenData = token;
      userService.findUserById(token.userId, callback);
    },
    function(userArr, callback){
      var user = userArr.length ? userArr[0] : {id:null};
      callback(null,user);
    },
    function(user, callback){  
      oauthService.modifyRefreshToken(refreshToken,private.getClientInfo()._id, user, callback);
    },
    function(user, callback){  
      callbackToken(null,{
        clientId:private.getClientInfo().randomId,
        expires:new Date(tokenData.expiresAt*1000),
        user:{user:user,oldRefreshToken:refreshToken},
        type:'refreshToken'
      });
    }
    
  ],function (err, result) {
    if(err){  
      log.error(err);  
      callbackToken(err);
    }

  });
  
};

module.exports.grantTypeAllowed = function (clientId, grantType, callback) {
  if (grantType === parameters.get('allowedGrandTypes')[6]) {
    return callback(false, true);
  }
  
  return callback(false, private.getClientInfo().allowedGrantTypes.indexOf(grantType) > -1);
};

module.exports.saveAccessToken = function (accessToken, clientId, expires, data, callback) {

  var model = {
    userId: data.user.id || null, 
    randomId : clientId,
    client : {
      "$db":config.get('mongoose:db'),
      "$id":private.getClientInfo()._id,
      "$ref":"client"
    } 
  };    

  if (data.type == "accessToken" && (data.user === false || !userService.checkPassword(data.user,data.password))) {
    callback(new AuthError(401,'authError'));
    return;
  }
  
  private.setAccessToken(accessToken);
  oauthService.generateToken(model,accessToken,"accessToken", callback);
  
};

module.exports.saveRefreshToken = function (refreshToken, clientId, expires, data, mainCallback) {

  var model = {
    userId: data.user.id || null, 
    randomId : clientId,
    client : {
      "$db":config.get('mongoose:db'),
      "$id":private.getClientInfo()._id,
      "$ref":"client"
    } 
  };    

  oauthService.generateToken(model,refreshToken, "refreshToken",  function(err,token){
    if(err) return mainCallback(err);
    if(!data.user.id) return mainCallback();
    
    async.waterfall([
      function(callback){
        userService.getInfoById(data.user.id, callback);
      },
      function(userInfo,callback){
       
        userInfo['access_token'] = {
          'access_token' : private.getAccessToken(),
          'expires_in' : config.get('security:tokenLife'),
          'expires_at' : token['expiresAt'],
          'token_type' : "bearer",
          'refresh_token' : token['token']
        };
        
        callback(null,userInfo);
      }
    ],function(err,result){
      if(err){
        return mainCallback(err);
      }
      
      var userInfo = require(appRoot + '/resources/serializer')("User")
        .setSerializeNull(false)
        .setGroups(["get_auth_user_info"])
        .serialize(result);
        
      var encrypted = require(appRoot + '/services/Auth/authService').encrypt(userInfo);
      var res = private.getResObject();
      
      res.cookie(parameters.get('cookie_private_data_name'),encrypted, { 
        maxAge: parameters.get('cookie_private_data_expire'), 
        domain:'.'+parameters.get('auth_cookie_domain'),
        httpOnly: true 
      });
            
      res.setHeader('Content-Type', 'application/json');
      
      mainCallback();
    });
    
    
    
  });
  
};

module.exports.extendedGrant = function (grantType, req, oauthCallback) {

  oauthService.authViaCustomGrandTypes.apply(this,arguments);
  
}

/*
 * Required to support password grant type
 */
module.exports.getUser = function (usernameOrEmail, password, oauthCallback) {

  async.waterfall([
      function(callback) {
        userService.findUserByUsernameOrEmail(usernameOrEmail,callback);
      },
      function(userArr, callback) {
        var user = userArr.length ? userArr[0] : false;
        oauthCallback(null,{password:password,usernameOrEmail:usernameOrEmail,user:user,type:'accessToken'});
      }
    ], function (err, result) {
      if(err){  
        log.error(err);  
        oauthCallback(err);
      }
      
    });
  
};