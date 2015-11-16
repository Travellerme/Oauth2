var express = require('express'),
  router = express.Router();


function getRoutes(app){
  
  router.post('/',app.oauth.authorise(),
    require('../../../controller/metricRegistration').writeMetricRegistration);
  
  return router;
}


module.exports = getRoutes;
