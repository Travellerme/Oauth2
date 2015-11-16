var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config/config.js'),

    fields = {
        userId: {
            type: Number
        },
        oauthClient: {},
        httpUserAgent: {},
        country: {},
        type: {
            type: Number,
            required: true
        },
        fromBy: {
            type: Number,
            required: true
        },
        socialServiceType:{
            type: Number,
        },
        email:{
            type: String,
        },
        username:{
            type: String,
        },
        httpRemoteAddr:{
            type: String,
        },
        status:{
            type: Number,
            required: true
        },
        created:{
            type: Date
        },
        description:{
            type: String,
        }
    },
    // MetricRegistration
    MetricRegistration = new Schema(fields,{ collection: 'metricRegistration' });

MetricRegistration.virtual('userBrowser')
  .set(function(userBrowser) {
    this._userBrowser = userBrowser;
  })
  .get(function() { return this._userBrowser; });    
  
MetricRegistration.virtual('userAgent')
  .set(function(userAgent) {
    this._userAgent = userAgent;
  })
  .get(function() { return this._userAgent; });    
  
MetricRegistration.virtual('userOs')
  .set(function(userOs) {
    this._userOs = userOs;
  })
  .get(function() { return this._userOs; }); 


MetricRegistration.pre('save', function(next){
  if(!this.created){
    this.created = Date.now();
  }
  this.userId = +this.userId || null;
  next();
});

exports.MetricRegistration = mongoose.model('MetricRegistration', MetricRegistration);
exports.const = {
    TYPE_PREREGISTRATION : 1,
    TYPE_REGISTRATION : 2,
    FROM_BY_AZUBU : 1,
    FROM_BY_SOCIAL_SERVICE : 2,
    SOCIAL_SERVICE_TYPE_FACEBOOK : 1,
    STATUS_FAIL : 0,
    STATUS_SUCCESS : 1
};
exports.fields = function(){
  return Object.keys(fields).reduce(function(obj, k) {
    obj[k] = null;
    return obj;
  }, {});
};