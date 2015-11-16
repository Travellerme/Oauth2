var AuthError = require('../error').AuthError,
  errorMessages = require('../error').messages,
  async = require('async'),
  UAParser = require('ua-parser'),
  metricService = require('../services/Metric/metricService'),
  lib = '../lib/',
  config = require('../config/config.js'),
  log = require(lib + 'log')(module,'main'),
  db = require(lib + 'db/mongoose'),
  MetricRegistrationConst = require('../models/metricRegistration').const,
  RefreshToken = require('../models/refreshToken'),
  MetricRegistrationFields = require('../models/metricRegistration').fields();
  
module.exports  = {
  writeMetricRegistration:function(req,res,next){
    var clientId = (!!req.oauth && !!req.oauth.bearerToken && !!req.oauth.bearerToken.clientMongoId) 
      ? req.oauth.bearerToken.clientMongoId : null;
    MetricRegistrationFields.oauthClient = {
      "$db":config.get('mongoose:db'),
      "$id":clientId,
      "$ref":"client"
    }
    
    if(!!req.body.userBrowser){
      var parser = UAParser.parse(req.body.userBrowser);
      
      MetricRegistrationFields.userBrowser = parser.ua.toString() || null;
      MetricRegistrationFields.userOs = parser.os.toString();
      MetricRegistrationFields.userAgent = req.body.userBrowser;
    }
    
      
    MetricRegistrationFields.type = MetricRegistrationConst.TYPE_PREREGISTRATION;
    MetricRegistrationFields.fromBy = !!req.body.fromBy ? (+req.body.fromBy) : MetricRegistrationConst.FROM_BY_AZUBU;
    MetricRegistrationFields.socialServiceType = !!req.body.socialServiceType ? (+req.body.socialServiceType) : null;
    
    MetricRegistrationFields.status = MetricRegistrationConst.STATUS_FAIL;
    MetricRegistrationFields.description = req.body.description || null;
    MetricRegistrationFields.httpRemoteAddr = req.body.userIp || null;
    
    if(!!req.body.success){
      MetricRegistrationFields.status = MetricRegistrationConst.STATUS_SUCCESS;
    }
    
    MetricRegistrationFields.userId = req.body.userId || null;
    MetricRegistrationFields.username = req.body.username || null;
    MetricRegistrationFields.email = req.body.email || null;

    metricService.writeMetricRegistration(MetricRegistrationFields)
      .then(function(){
        res.json({ success: true });
      })
      .fail(next);
  }
 
};
