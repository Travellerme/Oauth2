var errorMessages = require(appRoot + '/error').messages,
  OAuth2Error = require('oauth2-server/lib/error'),
  async = require('async'),
  ipaddr = require('ipaddr.js'),
  _ = require('underscore'),
  UAParser = require('ua-parser'),
  metricService = require(appRoot + '/services/Metric/metricService'),
  config = require(appRoot + '/config/config.js'),
  log = require(appRoot + '/lib/log')(module,'main'),
  db = require(appRoot + '/lib/db/mongoose'),
  MetricLoginConst = require(appRoot + '/models/metricLogin').const,
  RefreshToken = require(appRoot + '/models/refreshToken');
  
var MetricLoginPrivate = {
  getUserData:function(metricLoginFields,req){
    var clientIpFull = require(appRoot + '/lib/requestIp').getClientIp(req),
    clientIpArr = clientIpFull.split(':'),
    clientIp = clientIpArr[clientIpArr.length-1];

    if(_.isEqual(ipaddr.process(clientIpFull), ipaddr.process(clientIp)) === true){
      clientIpFull = clientIp;
    }

    metricLoginFields.httpRemoteAddr = req.body['user_ip'] || clientIpFull;

    var userAgent = req.body['user_browser']  || req.headers['user-agent']
      parser = UAParser.parse(userAgent);
      
    metricLoginFields.userBrowser = parser.ua.toString() || null;
    metricLoginFields.userOs = parser.os.toString();
    metricLoginFields.userAgent = req.headers['user-agent'];
    
    return metricLoginFields;
    
  },
  getMapingSocialServiceByName : function(socialServiceName){
    if(!socialServiceName) 
      return null;
    
    switch (socialServiceName.toLowerCase()) {
      case 'facebook':
        return MetricLoginConst.SOCIAL_SERVICE_TYPE_FACEBOOK;
    }
    return null;
  },
  writeMetricLogin:function(err,req,res){

    metricLoginFields = this.getUserData(require(appRoot + '/models/metricLogin').fields(),req);
      
    
    metricLoginFields.oauthClient = (!!req.oauth && !!req.oauth.client && !!req.oauth.client.clientMongoId) 
      ? {
          "$db":config.get('mongoose:db'),
          "$id":req.oauth.client.clientMongoId,
          "$ref":"client"
      } : null
    
    metricLoginFields.type = MetricLoginConst.TYPE_LOGIN;
    
    metricLoginFields.fromBy = MetricLoginConst.FROM_BY_AZUBU;
    
    switch (req.body.grant_type){
      case 'refresh_token':
        metricLoginFields.type = MetricLoginConst.TYPE_REFRESH_TOKEN;
        break;
      case 'http://localhost.com':
        metricLoginFields.fromBy = MetricLoginConst.FROM_BY_SOCIAL_SERVICE;
        metricLoginFields.socialServiceType = this.getMapingSocialServiceByName(req.body.social_service_name);
        break; 
    }
    
    metricLoginFields.status = !!err ? MetricLoginConst.STATUS_FAIL : MetricLoginConst.STATUS_SUCCESS;
    if(!!err && err instanceof OAuth2Error){
      metricLoginFields.description = req.metricDescription || ( 
        (err.message || errorMessages['authError'])
        +"[ server_error ] "
        +(req.body.username ? " [ username = '"+req.body.username+"' ]" : "")
        +(req.body.grant_type && req.body.refresh_token ? " [ refresh_token = '"+req.body.refresh_token+"' ]" : "")
        +(req.body.client_id ? " [ client_id = '"+req.body.client_id+"' ]" : "")) || null;
    }
    
    metricLoginFields.description = metricLoginFields.description || req.metricDescription || null;
        
    if(!req.user || !req.user.user || !req.user.user.id){
      return metricService.writeMetricLogin(metricLoginFields);
    }
    
    metricLoginFields.userId = req.user.user.id;
    metricLoginFields.username = req.user.user.username || null;
    metricLoginFields.email = req.user.user.email || null;
    
    return metricService.writeMetricLogin(metricLoginFields);

  }
};

module.exports  = {
  
  writeSuccessMetricLogin:function(req,res,next){
    if(!req.body.grant_type || req.body.grant_type === 'client_credentials' 
        || !!req.body.withoutMetric || !!req.leaveMetric){
      return next();
    }
    
    MetricLoginPrivate.writeMetricLogin(null,req,res)
      .then(function(){
        next();
      })
      .fail(next);
    
  },
  writeFailMetricLogin:function(err,req,res,next){
    if(!req.body.grant_type || req.body.grant_type === 'client_credentials' 
        || !!req.body.withoutMetric || !!req.leaveMetric){
      return next(err);
    }
    
    MetricLoginPrivate.writeMetricLogin(err,req,res)
     .then(function(){
        next(err);
      })
      .fail(next);
    
  }
    
};
