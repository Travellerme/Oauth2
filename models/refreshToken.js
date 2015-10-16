var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config/config.js'),

    RefreshToken = new Schema({
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
    },{ collection: 'refreshToken' });
    
    RefreshToken.pre('save', function(next){
      this.expiresAt = +(+new Date()/1000 + config.get('security:tokenLife')).toFixed();
      next();
    });

module.exports = mongoose.model('RefreshToken', RefreshToken);