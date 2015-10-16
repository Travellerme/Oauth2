var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config/config.js'),

    // UserAgent
    UserAgent = new Schema({
        hash: {
            type: String,
            unique: true,
            required: true
        },
        userBrowser: {
            type: String
        },
        userOs: {
            type: String
        },
        description:{
            type: String,
            required: true
        }
    },{ collection: 'userAgent' });

UserAgent.pre('save', function(next){
  this.created = Date.now();
  next();
});

module.exports  = mongoose.model('UserAgent', UserAgent);
