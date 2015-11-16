var express = require('express'),
  router = express.Router();


function getRoutes(app){
  
  router.use('/v2/token',require('../../../middleware/checkParams'), 
    require('../../../lib/auth/oauth2server').setResponse,
    app.oauth.grant(),
    require('../../../controller/metricLogin').writeFailMetricLogin,  
    require('../../../controller/metricLogin').writeSuccessMetricLogin);

  
  return router;
}


module.exports = getRoutes;
