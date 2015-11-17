var express = require('express'),
  router = express.Router();


function getRoutes(app){
     
  router.get('/:userId/token',
    app.oauth.authorise(),
    function(req,res,next){
      req.leaveMetric = true;
      next();
    },
    require(appRoot + '/controller/oauth2').generateUserIdGrandType,  
    require(appRoot + '/middleware/checkParams'), 
    require(appRoot + '/lib/auth/oauth2server').setResponse,
    app.oauth.grant(),
    require(appRoot + '/controller/metricLogin').writeFailMetricLogin,  
    require(appRoot + '/controller/metricLogin').writeSuccessMetricLogin);

  
  return router;
}


module.exports = getRoutes;
