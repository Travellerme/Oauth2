var express = require('express'),
  router = express.Router();


function getRoutes(app){
     
  router.get('/:userId/token',
    app.oauth.authorise(),
    function(req,res,next){
      req.leaveMetric = true;
      next();
    },
    require('../../../controller/oauth2').generateUserIdGrandType,  
    require('../../../middleware/checkParams'), 
    require('../../../lib/auth/oauth2server').setResponse,
    app.oauth.grant(),
    require('../../../controller/metricLogin').writeFailMetricLogin,  
    require('../../../controller/metricLogin').writeSuccessMetricLogin);

  
  return router;
}


module.exports = getRoutes;
