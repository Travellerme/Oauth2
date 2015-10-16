var AccessToken = require('../models/accessToken'),
  RefreshToken = require('../models/refreshToken'),
  crypto = require('crypto'),
  config = require('../config/config.js'),
  pgQuery = require('../lib/db/pg'),
  log = require('../lib/log')(module);


exports.findUserById = function(userId,callback){
  var results = [];
  pgQuery(function(client){
    var query = client.query('select id,salt,password from "user" where id=$1',[userId]);

    query.on('row', function(row) {
        results.push(row);
    });
    
    query.on('error', function(error) {
      callback(error);
    });

    query.on('end', function() {
      client.end();
      callback(null,results);
    });

  },callback);
};

exports.findUserByUsernameOrEmail = function(usernameOrEmail,callback){
  var results = [];
  pgQuery(function(client){
    var query = client.query('select id,salt,password from "user" where '
      +'username=$1 or email=$1 limit 1',[usernameOrEmail.toString().toLowerCase()]);

    query.on('row', function(row) {
        results.push(row);
    });
    
    query.on('error', function(error) {
      callback(error);
    });

    query.on('end', function() {
      client.end();
      callback(null,results);
    });

  },callback);
};

exports.encodePassword = function (raw, salt) {
    var salted = raw + '{'+salt+'}',
        hash = crypto.createHash('sha512').update(salted, 'utf-8');

    for (var i = 1; i < config.get('security:iterations'); i++) {
        hash = crypto.createHash('sha512').update(hash.digest('binary')+salted);
    }

    return hash.digest('hex');
};

exports.checkPassword = function(user,password){
  return user['password'] === this.encodePassword(password,user['salt']);
}


