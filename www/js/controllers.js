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
  //  FOR FINDING THE CLOSEST STATIONS
  //  *******************************************


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




    var service = new google.maps.DistanceMatrixService();
    function addAllDurationsToArray(){
      arrayOfDurations= [];
      $scope.closestStation = "Testing Shell";
      navigator.geolocation.getCurrentPosition(onSuccessGetLocation, onErrorGetLocation);
      for(var i = 0; i < stationsCoordinates.length; i++){
        //this ideally should be a function but Im struggling to understand
        //returning variables in javascript
          service.getDistanceMatrix(
            {
              origin:  $scope.myLatLngForPosition,
              destination: stationsCoordinates[i],
              travelMode: 'DRIVING',
            }, callback);

          function callback(response, status) {
            alert(JSON.stringify(response));
          }
        }
      //callback();
    }

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
        document.getElementById('editBox').style.marginTop = '115%';
      }  else{
          document.getElementById('editBox').style.height = '31%';
          document.getElementById('editBox').style.marginTop = '80%';
        }
    }

    //  *******************************************
    //  GETTING THE DATA FROM THE FIREBASE DATABASE
    //  *******************************************
    var data = null;
    function setupFuelStations(){
      var datafromDatabase = database.ref().child("Stations").limitToLast(100);
      datafromDatabase.on('value', function(snapshot) {
        data = snapshot.val();
        createStationMarkers(data);
      });
    }


    //  ******************************************************************
    //  CREATING THE FUEL STATION MARKERS AND ADDING THEM TO THE MAP
    //  ******************************************************************
    //This will store the Position of all the stations so that in the future
    //I will be able to loop through this to get the closest station
    var stationsCoordinates = [];
    function createStationMarkers(data){
      $scope.amountOfStations = data.length;
      for(var i = 0; i < $scope.amountOfStations; i++){
        var image = "../www/img/"+data[i].Icon;
        var icon = {
          url: image, // url
          scaledSize: new google.maps.Size(20, 20), // scaled size
          origin: new google.maps.Point(0,0), // origin
          anchor: new google.maps.Point(0, 0) // anchor
        };
        var name = data[i].Name;
        var dieselPrice = data[i].DieselPrice;
        var petrolPrice = data[i].PetrolPrice;
        var lat = data[i].Position.Lat;
        var lng = data[i].Position.Lng;
        var coordinate = new google.maps.LatLng(lat,lng);
        //add the coordinate to the array
        stationsCoordinates[i] = coordinate;
        var content = "<div><h5>Diesel:</h5>"+dieselPrice+" </div><div><h5>Petrol:</h5>"+petrolPrice+"</div>"
        //var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
        var stationMarker = new google.maps.Marker({
          map: $scope.map,
          id: i,
          position: coordinate,
          title: name,
          icon: icon
        });

        var infowindow = new google.maps.InfoWindow({
            content: content
          });

        stationMarker.addListener('click', function() {
            infowindow.open($scope.map, stationMarker);
         });
      }
  }

  //  *************************
  //  FOR CLOSEST STATION
  //  *************************
  var arrayOfDurations = [];
  var service = new google.maps.DistanceMatrixService();
  function getDistances(callback){
     var durationTimes = [];
    service.getDistanceMatrix(
      {
        origins: ["Sheffield"],
        destinations: stationsCoordinates,
        travelMode: 'DRIVING',
        avoidHighways: false,
        avoidTolls: false,
      }, function(response, status) {
        if (status === 'OK') {
          //alert(JSON.stringify(response.rows.elements.duration.text));
          //alert(JSON.stringify(response.rows[0].elements[0].duration.text));
          //alert(JSON.stringify(response.rows[0].elements));
          //alert(JSON.stringify(response.rows[0].elements[0]));
          //alert(JSON.stringify(response.rows[0].elements.length));

          for(i = 0; i<$scope.amountOfStations; i++){
            durationTimes.push(response.rows[0].elements[i].duration.value);
          }
          callback(durationTimes);
        } else {
          alert('Directions request failed due to ' + status);
        }
      });

    };

    function findClosestStation(durationTimes){
      var shortestDuration = null;
      var stationNumber = null;
      for (i = 0; i < $scope.amountOfStations; i++){
        var durationTime = durationTimes[i];
        if(shortestDuration === null){

          shortestDuration = durationTime;
        }else{

          if(durationTime<= shortestDuration){
            shortestDuration = durationTime;
            stationNumber = i;
          }
        }
      }
      alert("Shortes duration time:"+shortestDuration);
      alert(data[stationNumber].Name);
      $scope.closestStation = data[stationNumber].Name;
    }

    $scope.searchForClosestStation = function(){
      getDistances(findClosestStation);
    }


  $scope.showArrayData = function(){
    alert(JSON.stringify(stationsCoordinates));
  }

});
