var config = require(appRoot + '/config/config'),
  parameters = require(appRoot + '/config/parameters');

var  private = {
  getDirName:function(category){
    return parameters.get("media_service:image:dir:"+category) || '';
  },
  getWebFullPath:function(){
    return private.getDomain() + private.getWebRootPath();
  },
  getDomain:function(){
    return parameters.get("media_service:media_domain") || '';
  },
  getWebRootPath:function(){
    return parameters.get("media_service:image:web_path") || '';
  },
  getDirNameDefaultImage:function(){
    return parameters.get("media_service:image:default_image:path") || '';
  },
  getNameDefaultImage:function(name){
    return parameters.get("media_service:image:default_image:image:"+name) || '';
  }
  
}
module.exports  = {
  getPartUrl:function(category){
    var dirName = private.getDirName(category);
    if (Array.isArray(dirName)) {
      dirName = dirName.join("/");
    }

    return private.getWebFullPath() + dirName;
  },
  getUrlDefaultImage:function(name){  
    return private.getWebFullPath() + [
      private.getDirNameDefaultImage(),
      private.getNameDefaultImage(name)
    ].join("/");
  }
 
  
};