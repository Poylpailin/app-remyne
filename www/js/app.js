(function(){

  var app = angular.module('remyne', ['ionic', 'ngCordova', 'remyne.picturestore', 'angularMoment', 'ngAnimate']);

  /******* Route *******/
  app.config(function($stateProvider, $urlRouterProvider){
    // Home page
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/home.html'
    });
    // List of all my photos
    $stateProvider.state('pictures', {
      url: '/pictures',
      templateUrl: 'templates/pictures.html',
      cache: false
    });
    // Else
    $urlRouterProvider.otherwise('/');
  });

  /* Montage */
  app.directive("drawing", function(){
    return {
      restrict: "A",
      link: function(scope, element){
        var can = document.getElementById('myCanvas');
        var ctx = element[0].getContext('2d');
        var img1 = loadImage(scope.picture.what, main);
        var img2 = loadImage(scope.picture.who, main);
        var logo1 = loadImage('img/angle-1.png', main);
        var logo2 = loadImage('img/angle-2.png', main);
        var imagesLoaded = 0;

        function main() {
          imagesLoaded += 1;
          if(imagesLoaded == 4) {
            ctx.drawImage(img1, 0, 0);
            ctx.drawImage(img2, 0, 300);
            ctx.drawImage(logo1, 10, 10);
            ctx.drawImage(logo2, 240, 540);
          }
        }

        function loadImage(src, onload){
          var img = new Image();
          img.onload = onload;
          img.src = src;
          return img;
        }
      }
    };
  });



  app.controller('PictureCtrl', function ($scope, PictureStore, $cordovaSocialSharing) {

/*
    FILTRES
*/

    app.filter('reverse', function() {
      return function(items) {
        return items.slice().reverse();
      };
    });

    /*
     FILTRES
     */



    $scope.vicTitle = '<img src="img/remynelogo.png" style=" width: auto; height: 100%; opacity: 0.9;">';

    $scope.pictures = PictureStore.list();
    $scope.removePicture = function (pictureId) {
      PictureStore.remove(pictureId);
    };


    $scope.isActive = {};
    //$scope.isActivemap = {};
    $scope.scrolle = true;

    $scope.onHold = function(pictureId) {
      $scope.isActive[pictureId] = true;
    };

    $scope.onTouch = function(pictureId) {
      $scope.isActive[pictureId] = false;
    };

    $scope.hideMap = function(){
      $scope.myValue2 = false;
      $scope.scrolle = true;
    };

    $scope.toggle = function(pictureId){
      $scope.isActive[pictureId] = !$scope.isActive[pictureId];
    };



    app.directive("addhideall", function(){
      return {
        restrict: "E",
        template: "try"
      }
    });

    //overlay sur tout l'ecran pr desactiver

    $scope.showMap = function (pictureId) {

      $scope.isActive[pictureId] = false;

      // Doit retourner le bon objet selon l'id
      var goodPicture = PictureStore.getId(pictureId);

      // Doit retourner l'objet
      console.log(goodPicture);

      var latPic = goodPicture.lat;
      var lonPic = goodPicture.lon;

      var myLatIng = {lat: latPic, lng: lonPic};

      var mapOptions = {
        center: myLatIng,
        zoom: 15
      };

      var map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);

      var marker = new google.maps.Marker({
        position: myLatIng,
        title: "Hello World!"
      });

      marker.setMap(map);

      $scope.myValue2 = true;
      $scope.scrolle= false;

    };

    $scope.sharePicture = function(pictureId){
      var goodPicture = PictureStore.getId(pictureId);
      console.log(goodPicture);

      var message = "Remyne me !" + goodPicture.date;
      var image = goodPicture.picture;
      var link = "benjamingaygeffroy.fr/remyne";

      $cordovaSocialSharing
          .shareViaFacebook(message, image, link)
          .then(function(result) {
            console.log('Success');
          }, function(err) {
            console.log('Pas de partage sur Facebook');
          });


    }
  });

  /******* Début CameraCtrl *******/
  app.controller('CameraCtrl', function($state, $scope, $cordovaCamera, PictureStore, $cordovaGeolocation, $cordovaProgress, $ionicModal) {

//MODAL

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('mention.html', function($ionicModal) {
      $scope.modal = $ionicModal;
    }, {
      // Use our scope for the scope of the modal to keep it simple
      scope: $scope,
      // The animation we want to use for the modal entrance
      animation: 'slide-in-up'
    });

    $ionicModal.fromTemplateUrl('condition.html', function($ionicModal) {
      $scope.modall = $ionicModal;
    }, {
      // Use our scope for the scope of the modall to keep it simple
      scope: $scope,
      // The animation we want to use for the modall entrance
      animation: 'slide-in-up'
    });





    //Setting

    $scope.showSetting = false;

    $scope.showSettings = function(){
      $scope.showSetting = !$scope.showSetting;
    }

    // Basic images

    $scope.picture = {
      what: "img/what.jpg",
      who: "img/who.jpg"
    };

    $scope.showSave = {
      what: false,
      who: false
    };

    $scope.positionPic = {
      lat: 0,
      lon: 0
    };

    $scope.choosePictureAlbum = function (index){

      $scope.showSave[index] = false;

      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 380.565371024736,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        correctOrientation: false
      };

      // Il ouvre l'appareil photo
      $cordovaCamera.getPicture(options)

          // Prise de la photo
          .then(function (data) {
            $scope.picture[index] = 'data:image/jpeg;base64,' + data;
            $scope.showSave[index] = true;
          });


      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            $scope.positionPic.lat  = position.coords.latitude;
            $scope.positionPic.lon = position.coords.longitude
          }, function(err) {
            console.log('Erreur')
          });
    };

    /* TAKE PICTURE */
    $scope.takePicture = function (index) {

      $scope.showSave[index] = false;

      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: false
      };

      // Il ouvre l'appareil photo
      $cordovaCamera.getPicture(options)

          // Prise de la photo
          .then(function (data) {
            $scope.picture[index] = 'data:image/jpeg;base64,' + data;
            $scope.showSave[index] = true;
          });


      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            $scope.positionPic.lat  = position.coords.latitude;
            $scope.positionPic.lon = position.coords.longitude
          }, function(err) {
            console.log('Erreur')
          });
    };

    /*TEST VICTOR*/
      $scope.vicTitle = '<img src="img/remynelogo.png" style="width: auto;height: 95%;opacity: 1;margin-top: 2px;;">';

    /* SAVE PICTURE */
    $scope.savePictures = function () {
      var canvas = document.getElementById('myCanvas');
      var dataUrl =  canvas.toDataURL("image/jpeg");

      $scope.picture =  dataUrl;

      // var dataUrl = document.getElementByTag('canvas').toDataURL('image/jpeg');
      PictureStore.create($scope.picture, $scope.positionPic.lat, $scope.positionPic.lon,
          function () { // callback dans picturestore.js
            $scope.showSave = {
              what: false,
              who: false
            };

            $scope.picture = {
              what: "img/what.jpg",
              who: "img/who.jpg"
            };

            $scope.positionPic = {
              lat: 0,
              lon: 0
            };

            $state.go('pictures');
          }
      );
    };

    /******* Fin CameraCtrl *******/
  });

  app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

}());
