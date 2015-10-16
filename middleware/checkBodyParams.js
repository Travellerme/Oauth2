module.exports = function(req, res, next) {

  if ((!req.body || (!req.body['client_id'] || !req.body['client_secret'] 
      || !req.body['grant_type'] || !req.body['username'] || !req.body['password']))
        && req.query['client_id'] && req.query['client_secret'] && req.query['grant_type']) {
    if(!req.body) req.body = {};
    req.body['client_id'] = req.query['client_id'];
    req.body['client_secret'] = req.query['client_secret'];
    req.body['grant_type'] = req.query['grant_type'];
    req.body['username'] = req.query['username'];
    req.body['password'] = req.query['password'];
    if(req.query['refresh_token']) 
      req.body['refresh_token'] = req.query['refresh_token'];
    if(req.query['client_credentials']) 
      req.body['client_credentials'] = req.query['client_credentials'];
    
  }
  next();
  
};