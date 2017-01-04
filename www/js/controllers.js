angular.module('starter.controllers', ['ionic','firebase'])

.controller('MapCtrl', function($scope, $state, $ionicLoading,  $ionicActionSheet, $ionicPopover, $firebase) {

  $scope.stateChanger = function(){
    $state.go('app.mainMap');
    $scope.directionsPresent = false;
  };

  $scope.goToMainMenu = function(){

  };

  //*******************************************
  //      FOR SETTING UP MAP
  //*******************************************
    $scope.mapCreated = function(map) {
      $scope.map = map;
      directionsDisplay.setMap($scope.map);
      onPageLoad();
    };

  //*******************************************
  //      FOR POP UP ACTION SHEET
  //*******************************************
     $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    //*******************************************
    //  Setting up everything when the map loads on the screen
    //********************************************/
    var database = null;
    function onPageLoad(){
      setupFirebaseConfig();
      setupFuelStations();
    }

    //setup my firebase configuration
    function setupFirebaseConfig(){
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
    //  GETTING THE DATA FROM THE FIREBASE DATABASE
    //  *******************************************
    function setupFuelStations(){
      var datafromDatabase = database.ref().child("Stations").limitToLast(100);
      var data = null;
      datafromDatabase.on('value', function(snapshot) {
        //alert(JSON.stringify(snapshot.val()));
        data = snapshot.val();

        placeStationMarkerOnMap(data);
        //createStations(data);
      });

    }

    function createStations(data){
      //data from the database
      alert(JSON.stringify(data));
    }

    function placeStationMarkerOnMap(data){
      //Details for the marker got from the database
      var image = "../www/img/"+data[0].Icon;
      var icon = {
        url: image, // url
        scaledSize: new google.maps.Size(25, 25), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
      };
      var name = data[0].Name;
      var lat = data[0].Position.Lat;
      var lng = data[0].Position.Lng;
      var coordinates = new google.maps.LatLng(lat,lng);

      //actuallyt creating the marker using the data collected
      var stationMarker = new google.maps.Marker({
        map: $scope.map,
        id: 2,
        position: coordinates,
        title: name,
        icon: icon
      });

      var content = "<div><h5>Diesel:</h5>  £1.38</div><div><h5>Petrol:</h5>  £1.14</div>"
      var infowindow = new google.maps.InfoWindow({
          content: content
        });

      stationMarker.addListener('click', function() {
         infowindow.open($scope.map, stationMarker);
       });
    }

    //  *******************************************
    //  Petrol Station array ( not set up properly yet)
    //  *******************************************
    function placeStationsOnMap(){
      var stations = [
        ['Bondi Beach', -33.890542, 151.274856, 4],
        ['Coogee Beach', -33.923036, 151.259052, 5],
        ['Cronulla Beach', -34.028249, 151.157507, 3],
        ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
        ['Maroubra Beach', -33.950198, 151.259302, 1]
      ];
    }



});
