var MetricLogin = require('../../models/metricLogin').MetricLogin,
  MetricRegistration = require('../../models/metricRegistration').MetricRegistration,
  UserAgent = require('../../models/userAgent'),
  config = require('../../config/config.js'),
  crypto = require('crypto'),
  async = require('async'),
  Q = require('q'),
  HttpError = require('../../error').HttpError,
  log = require('../../lib/log')(module);

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
      callback(null);
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
        if (!agent) { 
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
        metricModel.httpUserAgent = null;
      }else{
        metricModel.httpUserAgent = {
            "$ref":"userAgent",
            "$id":agent._id ,
            "$db":config.get('mongoose:db') 
        };
      }

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