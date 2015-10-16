var AuthError = require('../error').AuthError,
  errorMessages = require('../error').messages,
  async = require('async'),
  requestIp = require('request-ip'),
  ipaddr = require('ipaddr.js'),
  _ = require('underscore'),
  UAParser = require('ua-parser'),
  metricService = require('../services/Metric/metricService'),
  lib = '../lib/',
  config = require('../config/config.js'),
  log = require(lib + 'log')(module),
  db = require(lib + 'db/mongoose'),
  MetricRegistrationConst = require('../models/metricRegistration').const,
  RefreshToken = require('../models/refreshToken'),
  MetricRegistrationFields = require('../models/metricRegistration').fields;
  
module.exports  = {
  writeMetricRegistration:function(req,res,next){
    MetricRegistrationFields.oauthClient = {
      "$ref":"client",
      "$id":req.authInfo.clientId ,
      "$db":config.get('mongoose:db') 
    }
    
    if(!!req.body.userBrowser){
      var parser = UAParser.parse(req.body.userBrowser);
      
      MetricRegistrationFields.userBrowser = parser.ua.toString() || null;
      MetricRegistrationFields.userOs = parser.os.toString();
      MetricRegistrationFields.userAgent = req.body.userBrowser;
    }
    
      
    MetricRegistrationFields.type = MetricRegistrationConst.TYPE_PREREGISTRATION;
    MetricRegistrationFields.fromBy = MetricRegistrationConst.FROM_BY_AZUBU;
    MetricRegistrationFields.status = MetricRegistrationConst.STATUS_FAIL;
    MetricRegistrationFields.description = req.body.description || null;
    MetricRegistrationFields.httpRemoteAddr = req.body.userIp || null;
    
    if(!!req.body.success){
      MetricRegistrationFields.status = MetricRegistrationConst.STATUS_SUCCESS;
    }
    
    MetricRegistrationFields.userId = req.body.userId || null;

    metricService.writeMetricRegistration(MetricRegistrationFields)
      .then(function(){
        res.json({ success: true });
      })
      .fail(next);
  }
 
};
