var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config/config.js'),

    // AccessToken
    AccessToken = new Schema({
        userId: {
            type: String
        },
        client: {},
        token: {
            type: String,
            unique: true,
            required: true
        },
        expiresAt:{
            type: Number
        }
    },{ collection: 'accessToken' });
    
    AccessToken.pre('save', function(next){
      this.expiresAt = +(+new Date()/1000 + config.get('security:tokenLife')).toFixed();
      next();
    });

module.exports  = mongoose.model('AccessToken', AccessToken);