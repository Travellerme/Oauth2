var db = require('./lib/db/mongoose'),
  Client = require('./models/client'),
  AccessToken = require('./models/accessToken'),
  AuthCode = require('./models/authorizationCodes'),
  RefreshToken = require('./models/refreshToken');
  MetricLogin = require('./models/metricLogin').MetricLogin,
  MetricRegistration = require('./models/metricRegistration').MetricRegistration,
  UserAgent = require('./models/userAgent');

setTimeout(function() {
    db.disconnect();
}, 3000);