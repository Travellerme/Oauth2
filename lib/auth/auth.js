var passport = require('passport'),
  BasicStrategy = require('passport-http').BasicStrategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  lib = '../../lib/',
  AuthError = require('../../error').AuthError,
  errorMessages = require('../../error').messages,
  Client = require('../../models/client');
  AccessToken = require('../../models/accessToken');

passport.use(new BasicStrategy(
    function(username, password, done) {

        Client.findOne({ clientId: username }, function(err, client) {
            if (err) { 
            	return done(err); 
            }
            
            if (!client) { 
            	return done(null, false); 
            }

            if (client.clientSecret !== password) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {

        Client.findOne({ randomId: clientId }, function(err, client) {
            if (err) { 
            	return done(err); 
            }

            if (!client) { 
            	return done(null, false); 
            }

            if (client.secret !== clientSecret) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));


/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */

passport.use(new BearerStrategy(
    function(accessToken, done) {
     
        AccessToken.findOne({ token: accessToken }, function(err, token) {

            if (err) { 
            	return done(err); 
            }

            if (!token) { 
            	return done(null, false); 
            }
            
            if( Math.round(Date.now()/1000-token.expiresAt) > 0 ) {

                return done(new AuthError(401,errorMessages.tokenExpired));
            }
            var info = { clientId:token.client.oid };
            done(null,true,info);

        });
    }
));
