var AccessToken = require('../models/accessToken'),
  RefreshToken = require('../models/refreshToken'),
  User = require('../models/user').const,
  Role = require('../models/role').const,
  UserProfile = require('../models/userProfile'),
  crypto = require('crypto'),
  config = require('../config/config.js'),
  pgQuery = require('../lib/db/pg'),
  dateFormat = require('dateformat'),
  log = require('../lib/log')(module,'main');

var private = {
  
};
module.exports = {
  getInfoById : function(id,callback){
    var results = {};
    var roles = [];
    var profile = {};
    if(!id){
      return callback(null,{});
    }
    pgQuery(function(client){
      var query = client.query('SELECT u.id as userId,u.email,u.username,u.status,u.created, '
        +' r.id as roleId,r.name,r.role,up.url_photo_small,up.first_name,up.last_name,pwc.id as pwcId FROM "user" u '
        +' INNER JOIN user_role ur ON u.id = ur.user_id '
        +' INNER JOIN role r ON r.id = ur.role_id '
        +' LEFT JOIN user_profile up ON u.id = up.user_id '
        +' LEFT JOIN pay_wizard_customer pwc ON u.id = pwc.user_id '
        +' WHERE u.id = $1 AND u.status = $2'
        ,[id,User.STATUS_ACTIVE]);
       
      query.on('row', function(row) {
        roles.push({id:row['roleid'],name:row['name'],role:row['role']})
        results['payment_account_exists'] = !!row['pwcid'];
        results['id'] = row['userid'];
        results['email'] = row['email'];
        results['username'] = row['username'];
        results['status'] = row['status'];
        results['created'] = row['created'];
        profile = {
          "first_name":row['first_name'],
          "last_name":row['last_name'],
          "url_photo_small":row['url_photo_small']
        };
      });

      query.on('error', function(error) {
        callback(error);
      });

      query.on('end', function() {
        client.end();
        results['created'] = dateFormat(results['created'],"yyyy-mm-dd");
        results['roles'] = roles;
        results['profile'] = profile;
        results['profile']['url_photo_small'] = UserProfile().getUrlPhotoSmall(results['profile']['url_photo_small']);
        callback(null,results);
      });

    },callback);
  },
  getUserByFacebookId : function(socialUserId,callback){
    var results = [];
    pgQuery(function(client){
      var query = client.query('SELECT u.id,u.salt,u.password,u.email,u.username FROM "user" u '
        +' INNER JOIN user_profile up ON u.id = up.user_id '
        +' WHERE up.facebook_id = $1 AND u.status = $2 limit 1'
        ,[socialUserId,User.STATUS_ACTIVE]);
       
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
  },
  findOneUserPremiumBroadcasterByUsernameOrEmail : function(usernameOrEmail,callback){
    var results = [];
    pgQuery(function(client){
      var query = client.query('SELECT u.id,u.salt,u.password,u.email,u.username FROM "user" u '
        +' INNER JOIN user_role ur ON u.id = ur.user_id '
        +' INNER JOIN role r ON r.id = ur.role_id '
        +' INNER JOIN user_package up ON u.id = up.user_id '
        +' INNER JOIN package p ON up.package = p.id '
        +' WHERE (LOWER(u.email) = $1 OR LOWER(u.username) = $1) '
        +' AND u.status = $2 AND r.role = $3 AND p.is_premium = $4 limit 1'
        ,[usernameOrEmail.toString().toLowerCase(),User.STATUS_ACTIVE,Role.ROLE_BROADCASTER,true]);
       
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
  },
  findOneUserAdminByUsernameOrEmail : function(usernameOrEmail,callback){
    var results = [];
    pgQuery(function(client){
      var query = client.query('SELECT u.id,u.salt,u.password,u.email,u.username FROM "user" u '
        +' INNER JOIN user_role ur ON u.id = ur.user_id '
        +' INNER JOIN role r ON r.id = ur.role_id '
        +' WHERE (LOWER(u.email) = $1 OR LOWER(u.username) = $1) '
        +' AND u.status = $2 AND r.role = $3 limit 1'
        ,[usernameOrEmail.toString().toLowerCase(),User.STATUS_ACTIVE,Role.ROLE_ADMIN]);
       
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
    
  },
  findUserById : function(userId,callback){
    var results = [];
    pgQuery(function(client){
      var query = client.query('SELECT id,salt,password,email,username FROM "user" WHERE id=$1',[userId]);

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
  },
  findUserByUsernameOrEmail : function(usernameOrEmail,callback){
    var results = [];
    pgQuery(function(client){
      var query = client.query('SELECT id,salt,password,email,username FROM "user" WHERE '
        +'username=$1 OR email=$1 limit 1',[usernameOrEmail.toString().toLowerCase()]);

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
  },
  encodePassword : function (raw, salt) {
      var salted = raw + '{'+salt+'}',
          hash = crypto.createHash('sha512').update(salted, 'utf-8');

      for (var i = 1; i < config.get('security:iterations'); i++) {
          hash = crypto.createHash('sha512').update(hash.digest('binary')+salted);
      }

      return hash.digest('hex');
  },
  checkPassword : function(user,password){
    return user['password'] === this.encodePassword(password,user['salt']);
  }  
};

