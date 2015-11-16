var HttpError = require('../../error').HttpError,
  AuthError = require('../../error').AuthError,
  errorMessages = require('../../error').messages,
  passport = require('passport');
  
module.exports = function(app) { 
  
  app.use('/oauth',require("./oauth2/oauth2")(app));
  
  app.use('/admin/user',require("./admin/user")(app));
  
  app.use('/auth',require("./auth/auth")(app));
  
  app.use('/metric/registration',require("./metric/registration")(app));
  
  app.use('/info/version',function(req,res,next){
    require('crypto').randomBytes(48, function(ex, buf) {
      res.end(buf.toString('hex'));
    });
  });
  
  
  
  
  app.use('/authError',function(req, res, next){
    next(new AuthError(401,errorMessages['authError']));
  });

  
  app.use(function(req, res, next){
    if(!res._headerSent){
      next(new HttpError(404));
    }
  });


};
