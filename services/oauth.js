var AccessToken = require('../models/accessToken'),
  RefreshToken = require('../models/refreshToken'),
  crypto = require('crypto'),
  config = require('../config/config.js'),
  log = require('../lib/log')(module);

// Generic error handler
var errFn = function (cb, err) {
	if (err) { 
		return cb(err); 
	}
};

exports.modifyRefreshToken = function (refreshToken,clientId, user, callback) {
  
  RefreshToken.update({ token: refreshToken,'client.$id': clientId }, { $set: { expiresAt: +(+new Date()/1000 + 1).toFixed() }},{safe:true},function(err,raw){
      if(err){ 
        callback(err);
        return;
      }
      callback(null,user);
  });
  
};

exports.generateTokens = function (data, done) {

	// curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done), 
	    refreshToken,
	    refreshTokenValue,
	    token,
	    tokenValue;

        
    //RefreshToken.remove(data, errorHandler);
    //AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save(function (err) {
    	if (err) {
			log.error(err);
    		return done(err); 
    	}
    	done(null, tokenValue, refreshTokenValue, { 
    		'expires_in': config.get('security:tokenLife') 
    	});
    });
};
