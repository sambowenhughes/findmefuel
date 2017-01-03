angular.module('starter.controllers', ['ionic','firebase'])

.controller('MapCtrl', function($scope, $state, $ionicLoading,  $ionicActionSheet, $ionicPopover, $firebase) {

  $scope.stateChanger = function(){
    $state.go('app.mainMap');
    $scope.directionsPresent = false;
  };

  $scope.goToMainMenu = function(){

  };
  //*******************************************
  //      FOR POP UP ACTION SHEET
  //*******************************************
     $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    /*

    If only you knew about the game I play
    sitting here infront of you - laughing all day
    when you find out I hope you laugh

    what to text, its baffiling me
    maybe mention an injury?
    If only you knew about the game I play
    sitting here infront of you - laughing all day
    how many times will it take to send
    before you reply and claim your spends

    oh so rude, Im very impressed
    its been a while since Ive seen your breasts
    half one seems so far away
    Id rather sneak under your table
    and have a play

    //---------------------------------------

    You do know the way to my heart
    A bit of welsh tongue and Im there in ...
    2017 should be fun


    You do know the way to my heart
    A bit fo welsh tongue and it egnites the spark
    2017 is going to be so fun
    I already miss your peachy bum
    I hope to see you sometime this month
    so the games can begin again we can have some fun





    //*******************************************
    //      Creating the firebase reference
    //********************************************/
    var database = null;
    function onPageLoad(){
      var config = {
        apiKey: "AIzaSyCYDlrU2O3OT4jaJnaCF5krqCbof67yTWU",
        authDomain: "findmefuel-3c346.firebaseapp.com",
        databaseURL: "https://findmefuel-3c346.firebaseio.com",
        storageBucket: "findmefuel-3c346.appspot.com",
        messagingSenderId: "386153049618"
      };
      firebase.initializeApp(config);
      database = firebase.database();
    }



   //*******************************************
   //      FOR SETTING UP MAP
   //*******************************************
   $scope.mapCreated = function(map) {
     $scope.map = map;
     directionsDisplay.setMap($scope.map);
     onPageLoad();

     //Hide the directions pop up when first loading app


   };

  //  *******************************************
  //  FOR GETTING MY LOCATION AND DISPLAYING MY MARKER
  //  *******************************************
     $scope.followMe = function () {
       if (!$scope.map) {
         return;
       };
       $scope.followingMe = true;
       createMarker();
       $scope.watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 3000000, enableHighAccuracy: true });
       $scope.map.setZoom(16);
     };

     $scope.stopFollowingMe = function(){
       $scope.followingMe = false;
       navigator.geolocation.clearWatch($scope.watchID);
       clearMyLocationMarker();
     };

     function clearMyLocationMarker(){
       var marker = markers[1];
       marker.setMap(null);
     }

     function onSuccess(position) {
        var myLatlng = {lat: position.coords.latitude, lng: position.coords.longitude};
        $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        $scope.myLocationMarker.setPosition(myLatlng);
      };

      function onError(error) {
          alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
      }

      //marker array
      var markers = {};

      function createMarker(){
        var id = 1;
        var icon = {
          url: "../www/img/car_icon.png", // url
          scaledSize: new google.maps.Size(30, 30), // scaled size
          origin: new google.maps.Point(0,0), // origin
          anchor: new google.maps.Point(0, 0) // anchor
      };
        var myImage = '';
        var meImage = 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/green.png';
        $scope.myLocationMarker = new google.maps.Marker({
          map: $scope.map,
          id: id,
          position: null,
          icon: icon
        });
        markers[id] = $scope.myLocationMarker;
      }

      //  *******************************************
      //  FOR GETTING DIRECTIONS TO A MARKER
      //  *******************************************
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
      directionsDisplay.setMap($scope.map);
      directionsDisplay.setPanel(document.getElementById('directions-panel'));

      $scope.getMeDirections = function(){
        navigator.geolocation.getCurrentPosition(onSuccessGetLocation, onErrorGetLocation);
        directionsService.route({
          //There is a delay from finding my position
          //this is therefore causing a lag and resulting
          //in having to tap the button twice
          origin: $scope.myLatLngForPosition,
          destination: "Trafford Quays Leisure Village",
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            $scope.directionsPresent = true;
            directionsDisplay.setDirections(response);

          } else {
            alert('Directions request failed due to ' + status);
          }
        });
      };

      var onSuccessGetLocation = function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $scope.myLatLngForPosition = {lat: lat, lng: lng};

    };

    function onErrorGetLocation(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    //  *******************************************
    //  FOR TOGGLING DIRECTIONS BOX
    //  *******************************************
    $scope.toggleView = function(){
      var divSize = document.getElementById("editBox").style.height;
      if (divSize != "10%"){
        document.getElementById('editBox').style.height = '10%';
        document.getElementById('editBox').style.marginTop = '145%';
      }  else{
          document.getElementById('editBox').style.height = '31%';
          document.getElementById('editBox').style.marginTop = '110%';
        }
    }

    //  *******************************************
    //  FOR FIREBASE
    //  *******************************************
    $scope.firebaseCheck = function(){
      var datafromDatabase = database.ref().child("database");
      datafromDatabase.on('value', function(snapshot) {
        alert(snapshot.val());
      });

    }

});
