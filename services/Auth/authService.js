var config = require(appRoot + '/config/config'),
  parameters = require(appRoot + '/config/parameters');

var  private = {
  encrypt:function(value){
    
    var crypto = require('crypto')
      , key = parameters.get('auth_hash_key')
      , iv = ''
      , cipher = crypto.createCipheriv('aes-128-ecb', key, iv)
      , crypted = cipher.update(value, 'utf-8', 'base64');
      
    crypted += cipher.final('base64');
    return crypted;    
    
    
  }
  
}
module.exports  = {
  encrypt:function(value){
    return private.encrypt(value);
  }
  
};