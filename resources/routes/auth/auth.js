var express = require('express'),
  router = express.Router();


function getRoutes(app){
     
  router.get('/user/info',
    app.oauth.authorise(),
    require(appRoot + '/controller/auth').userInfo);

  
  return router;
}


module.exports = getRoutes;
