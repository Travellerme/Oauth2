module.exports = function (module,type) {
  try {
      return require('./log/'+type)(module);
  } catch(err) {
    if(err){
      var logger = require('./log/main')(module);
      logger.error(err);
      return logger;
    }
  }

}

