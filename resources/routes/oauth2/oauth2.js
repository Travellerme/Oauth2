var express = require('express'),
  router = express.Router();


function getRoutes(app){
  
  router.use('/v2/token',require(appRoot + '/middleware/checkParams'), 
    require(appRoot + '/lib/auth/oauth2server').setResponse,
    app.oauth.grant(),
    require(appRoot + '/controller/metricLogin').writeFailMetricLogin,  
    require(appRoot + '/controller/metricLogin').writeSuccessMetricLogin);

  
  return router;
}


module.exports = getRoutes;
