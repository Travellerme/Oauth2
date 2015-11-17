var log = require(appRoot + '/lib/log')(module,'scripts'),
  db = require(appRoot + '/lib/db/mongoose'),
  parameters = require('./config/parameters.js'),
  Client = require('./models/client'),
  AccessToken = require('./models/accessToken'),
  AuthCode = require('./models/authorizationCodes'),
  RefreshToken = require('./models/refreshToken');
  MetricLogin = require('./models/metricLogin').MetricLogin,
  MetricRegistration = require('./models/metricRegistration').MetricRegistration,
  UserAgent = require('./models/userAgent');

Client.remove({}, function(err) {
    var client = new Client({ 
        name: parameters.get("default:client:name"), 
        randomId: parameters.get("default:client:clientId"), 
        secret: parameters.get("default:client:clientSecret"), 
        redirectUris: parameters.get("default:client:redirectUris"), 
        allowedGrantTypes: parameters.get("default:client:allowedGrantTypes") 
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

MetricRegistration.remove({}, function (err) {
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