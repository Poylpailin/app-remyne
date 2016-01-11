angular.module('remyne.picturestore', [])
  .factory('PictureStore', function(){

  var pictures = angular.fromJson(window.localStorage['pictures'] || '[]');

    function persist(){
    window.localStorage['pictures'] = angular.toJson(pictures);
  }

  return {
    list: function(){
      console.log(pictures);
      return pictures;
    },


    create: function(thePicture, positionPicLat, positionPicLon, callback){

      pictures.push({
        id: new Date().getTime().toString(),
        picture: thePicture,
        date: new Date().getTime(),
        lat: positionPicLat,
        lon: positionPicLon
      });
      persist();
      callback();
    },

    remove: function(pictureId){
    for(var i =0; i < pictures.length; i++){
      if(pictures[i].id == pictureId){
        pictures.splice(i, 1);
        persist();
      }
    }
    },


    getId: function(pictureId) {
      for (var i = 0, len = pictures.length; i < len; i += 1) {
        if (pictures[i].id == pictureId) {
          return pictures[i];
        }
      }
    }

  };
});
