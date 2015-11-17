var validUrl = require('valid-url'),
  imagePathService = require(appRoot + '/services/Media/imagePathService'),
  private = {
    defaultUrlPhotoSmall : null,
    imgUrlPath : null,
    initImage : function(){
      this.setImgUrlPath(imagePathService.getPartUrl('user_profile'));
      this.setDefaultUrlPhotoSmall(imagePathService.getUrlDefaultImage('profile_photo_small'));
    }
  };

function UserProfile (){
  if (!(this instanceof UserProfile)) return new UserProfile();
  private.initImage.call(this);
}
 
UserProfile.prototype.setImgUrlPath = function(path){
  private.imgUrlPath = path;
};
UserProfile.prototype.setDefaultUrlPhotoSmall = function(path){
  private.defaultUrlPhotoSmall = path;
};

UserProfile.prototype.getUrlPhotoSmall = function(urlPhotoSmall){
  var url = private.defaultUrlPhotoSmall;
  if (validUrl.isUri(urlPhotoSmall)){
    url = urlPhotoSmall;
  } else if(private.imgUrlPath && !!urlPhotoSmall){
    url = [
      private.imgUrlPath,
      urlPhotoSmall[0],
      urlPhotoSmall[1],
      urlPhotoSmall
    ].join('/');
  }
  return url;
};


module.exports = UserProfile;
