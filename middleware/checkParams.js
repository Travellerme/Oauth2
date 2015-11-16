module.exports = function(req, res, next) {

  if(req.is('application/x-www-form-urlencoded')){
    next();
    return;
  }
  
  req.headers['content-type'] = "application/x-www-form-urlencoded; charset=UTF-8";

  req.method = "POST";

  req.body['client_id'] = req.body['client_id'] || req.query['client_id'], 
  req.body['client_secret'] = req.body['client_secret'] || req.query['client_secret'];
  req.body['grant_type'] = req.body['grant_type'] || req.query['grant_type'];
  req.body['username'] = req.body['username'] || req.query['username'];
  req.body['password'] = req.body['password'] || req.query['password'];
  req.body['refresh_token'] = req.body['refresh_token'] || req.query['refresh_token'];
  req.body['client_credentials'] = req.body['client_credentials'] || req.query['client_credentials'];
  req.body['social_service_name'] = req.body['social_service_name'] || req.query['social_service_name'];
  req.body['social_service_token'] = req.body['social_service_token'] || req.query['social_service_token'];
  req.body['social_service_token_secret'] = req.body['social_service_token_secret'] || req.query['social_service_token_secret'];
  req.body['user_ip'] = req.body['user_ip'] || req.query['user_ip'];
  req.body['user_browser'] = req.body['user_browser'] || req.query['user_browser'];
  req.body['withoutMetric'] = req.body['withoutMetric'] || req.query['withoutMetric'] || null;
  
  req.headers['content-length'] = JSON.stringify(req.body).length;

  next();
  
};