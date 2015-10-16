var HttpError = require('../error').HttpError,
  AuthError = require('../error').AuthError,
  errorMessages = require('../error').messages,
  passport = require('passport');
  
module.exports = function(app) {
  
//requestIp = require('request-ip'),
  app.use('/oauth/token',require('../middleware/checkBodyParams'), require('../controller/oauth2').token);
  app.post('/metric/registration', passport.authenticate('bearer', { session: false }),require('../controller/metricRegistration').writeMetricRegistration);
  app.use('/authError',function(req, res, next){
    next(new AuthError(401,errorMessages['authError']));
  });

  
  app.use(function(req, res, next){
    next(new HttpError(404));
  });


};
