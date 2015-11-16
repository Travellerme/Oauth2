var errorMessages = require('../error').messages,
  HttpError = require('../error').HttpError,
  async = require('async'),
  parametrs = require('../config/parameters');
  
var private = {
 
};

module.exports  = {
  
  generateUserIdGrandType:function(req,res,next){
    req.body['userId'] = req.params['userId'];
    if(!req.body['userId']){
      return next(new HttpError(400,errorMessages['missingOauthUserIdParams']));
    }
    
    req.body['grant_type'] = parametrs.get('allowedGrandTypes')[6];
    
    req.body['client_id'] = req.oauth.bearerToken.clientId, 
    req.body['client_secret'] = req.oauth.bearerToken.clientSecret;
    
    next();

  }   
  
 
};
