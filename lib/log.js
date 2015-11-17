module.exports = function (module,type) {
  try {
      return require(appRoot + '/lib/log/'+type)(module);
  } catch(err) {
    if(err){
      var logger = require(appRoot + '/lib/log/main')(module);
      logger.error(err);
      return logger;
    }
  }

}

