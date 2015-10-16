var faker = require('faker'),
  lib = './lib/',
  log = require(lib + 'log')(module),
  db = require(lib + 'db/mongoose'),
  config = require('./config/parameters.js'),
  Client = require('./models/client'),
  AccessToken = require('./models/accessToken'),
  AuthCode = require('./models/authorizationCodes'),
  RefreshToken = require('./models/refreshToken');
  MetricLogin = require('./models/metricLogin').MetricLogin,
  UserAgent = require('./models/userAgent');

Client.remove({}, function(err) {
    var client = new Client({ 
        name: config.get("default:client:name"), 
        randomId: config.get("default:client:clientId"), 
        secret: config.get("default:client:clientSecret") 
    });
    
    client.save(function(err, client) {

        if(!err) {
            log.info("New client - %s:%s", client.randomId, client.secret);
        } else {
            return log.error(err);
        }

    });
});

AccessToken.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

RefreshToken.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

AuthCode.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

MetricLogin.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

UserAgent.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

setTimeout(function() {
    db.disconnect();
}, 3000);