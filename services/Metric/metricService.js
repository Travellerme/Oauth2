var MetricLogin = require(appRoot + '/models/metricLogin').MetricLogin,
  MetricRegistration = require(appRoot + '/models/metricRegistration').MetricRegistration,
  UserAgent = require(appRoot + '/models/userAgent'),
  config = require(appRoot + '/config/config.js'),
  crypto = require('crypto'),
  async = require('async'),
  Q = require('q'),
  HttpError = require(appRoot + '/error').HttpError,
  log = require(appRoot + '/lib/log')(module,'main');

var metricPrivate = {
  getHttpUserAgentByDescription:function(hash,callback){
    if(hash){
      UserAgent.findOne({ hash: hash },function(err,agent){
        if(err){
          callback(err);
        } else {
          callback(null,hash,agent);
        }

      });

    }else{
      callback(null,null,null);
    }
  },
  createUserAgent:function(data,callback){
    userAgent = new UserAgent(data);
    userAgent.save(callback);
  },
  writeMetric:function(metricModel){

    var hash = metricModel.userBrowser ? crypto.createHash('md5').update(metricModel.userBrowser).digest("hex") : null,
      deferred = Q.defer();

    async.waterfall([
      function(callback) {
        metricPrivate.getHttpUserAgentByDescription(hash,callback);
      },
      function(hash, agent, callback) {
        if (!agent && !!hash) {
          
          metricPrivate.createUserAgent({
            hash:hash,
            userOs:metricModel.userOs,
            userBrowser:metricModel.userBrowser,
            description:metricModel.userAgent
          },callback);
        } else {
          callback(null,agent);
        }
        
      }
        
    ], function (err, agent) {
      if(err){  
        log.error(err); 
      }
      metricModel.httpUserAgent = (!!agent && !!agent._id) ? 
        metricModel.httpUserAgent = {
            "$db":config.get('mongoose:db'),
            "$id":agent._id,
            "$ref":"userAgent"
        } : null;

      metricModel.save(function(err){
        if(err){ 
          log.error(err);
          deferred.reject(err);
        } else {
          deferred.resolve(true);
        }
      });

    });
    
    return deferred.promise;
   
  }
}
module.exports  = {
  writeMetricLogin:function(data){
    return metricPrivate.writeMetric(new MetricLogin(data));
  },
  writeMetricRegistration:function(data){
    return metricPrivate.writeMetric(new MetricRegistration(data));
  },
 
  
};