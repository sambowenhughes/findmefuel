angular.module('starter.controllers', ['ionic','firebase'])

.controller('MapCtrl', function($scope, $state, $ionicLoading,  $ionicActionSheet, $ionicPopover, $firebase, $ionicPopup) {

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
      $scope.directionsDisplay.setMap($scope.map);
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
      $scope.directionsPresent = false;
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


      var markers = {};

      function createMarker(){
        var id = 1;
        var icon = {
          url: "../www/img/car_iconWhite.png", // url
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

      /********************************************************
      FOR FINDING MY LOCATION
      /************************************************/
      function findMyLocation(){
        navigator.geolocation.getCurrentPosition(onSuccessGetLocation, onErrorGetLocation);
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
        document.getElementById('editBox').style.marginTop = '150%';
      }  else{
          document.getElementById('editBox').style.height = '31%';
          document.getElementById('editBox').style.marginTop = '110%';
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
        var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
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
    var distance = [];
    var durationTextTime = [];
    findMyLocation();
    service.getDistanceMatrix(
      {
        origins: [$scope.myLatLngForPosition],
        destinations: stationsCoordinates,
        travelMode: 'DRIVING',
        avoidHighways: false,
        avoidTolls: false,
      }, function(response, status) {
        if (status === 'OK') {
          //loop through the response and add the duration to the array
          for(i = 0; i<$scope.amountOfStations; i++){
            //should not be passing three arrays over ideally one array
            durationTimes.push(response.rows[0].elements[i].duration.value);
            distance.push(response.rows[0].elements[i].distance.text);
            durationTextTime.push(response.rows[0].elements[i].duration.text);
          }
          // alert("check");
          // alert("distance:"+distance);
          callback(durationTimes, distance, durationTextTime);

        } else {
          alert('Directions request failed due to ' + status);
        }
      });

    };



    $scope.KPG = null;
    $scope.averageFuelPrice = null;
    $scope.listOfStationsFound = [];
    $scope.stationFound = {};
    $scope.stationFound2 = {};
    function findClosestStation(durationTimes, distance, durationTextTime){

    //
    //   var stationNumber = null;
    //   for (i = 0; i < $scope.amountOfStations; i++){
    //     var durationTime = durationTimes[i];
    //     if(shortestDuration === null){
    //       shortestDuration = durationTime;
    //     }
    //       if(durationTime<= shortestDuration){
    //         shortestDuration = durationTime;
    //         stationNumber = i;
    //       }else{
    //         alert("no stations to show");
    //       }
    //
    //   }
    //   $scope.stationFound =  data[stationNumber];
    //   //  $scope.stationFound.distancetoDest =  "wooo";
    //
    //   // $scope.stationFound.timeTakenString = durationTextTime[stationNumber];
    //   // $scope.listOfStationsFound.push(stationFound);
    //
    //   showPopUp(stationNumber);
    // }
    //
    //
    // var shortestDuration = null;
    //
    //   var stationNumber = null;
    //   var stationNumber2 = null;
    //   for (i = 0; i < $scope.amountOfStations; i++){
    //     var durationTime = durationTimes[i];
    //     if(shortestDuration === null){
    //       shortestDuration = durationTime;
    //     }
    //       if(durationTime<= shortestDuration){
    //         stationNumber2 = stationNumber.value;
    //         shortestDuration = durationTime;
    //         stationNumber = i;
    //       }else{
    //         alert("no stations to show");
    //       }
    // }


      var copy = JSON.parse(JSON.stringify(durationTimes));
      var sortedDurationTimes = durationTimes.sort();
      //THERE IS A BUG WITH JAVASCIPTS ARRAY.SORT()
      //IT DOESNT WORK IF THERE IS A HUGE DIFFERENCE WITHIN VALUES

      var getShortestTime = sortedDurationTimes[0];
      var getSecondShortestTime = sortedDurationTimes[1];

      //GET THE INDEX OF THE STATION IN THE LIST SO THAT WE CAN GET IT FROM THE
      //FIREBASE DATABASE
      var stationNumber = copy.indexOf(getShortestTime);
      var stationNumber2 = copy.indexOf(getSecondShortestTime);

      //ALL INFORMATION ABOUT THE CLOSEST STATION
      $scope.stationFound.closestStation = data[stationNumber];
      $scope.stationFound.distancetoDest = distance[stationNumber];
      $scope.stationFound.timeTakenString = durationTextTime[stationNumber];
      //ALL INFORMATION ABOUT THE SECOND CLOSEST STATION
      $scope.stationFound2.closestStation = data[stationNumber2];
      $scope.stationFound2.distancetoDest = distance[stationNumber2];
      $scope.stationFound2.timeTakenString = durationTextTime[stationNumber2];

      //PARSE THE TIME TAKEN INTO AN INT SO A CALCULATION CAN BE MADE
      var closestTimeTaken =  parseInt($scope.stationFound.timeTakenString);
      var closestTimeTaken2 = parseInt($scope.stationFound2.timeTakenString);
      //CALCULATE THE EXTRA TIME TAKEN TO GET TO THE NEXT STATION
      $scope.extraTimeTaken = closestTimeTaken2 - closestTimeTaken;

      if(($scope.KPG != null)&&($scope.averageFuelPrice != null)){
        //CALCULATING JOURNEY COST TO CLOSEST STATION
        //KM per gallon of the vehicle (need to change this so it gets it from the preferences page) ---------------
        var KPG = parseInt($scope.KPG);
        //remove the KM from the string so that it can be parsed later on
        var closestStationDistanceAsString = $scope.stationFound.distancetoDest.replace('km','');
        //parse the string into a float
        var closestStationDistance = parseFloat(closestStationDistanceAsString);
        var fuelcost = parseInt($scope.averageFuelPrice); //£1 (Need to change this so that it gets it from the prefeenreces page)-----------------
        var ALIG = 4.54609; //Amount of litres in a gallon

        //CALCULATION FOR COST OF JOURNEY
        var gallonsUsed = closestStationDistance/KPG;
        var costOfJourney = (((gallonsUsed*ALIG)*fuelcost)/100);
        $scope.costOfJourney = costOfJourney.toFixed(2);
        //CALCULATING JOURNEY COST TO SECOND CLOSEST STATION
        var closestStationDistanceAsString2 = $scope.stationFound2.distancetoDest.replace('km','');
        var closestStationDistance2 = parseFloat(closestStationDistanceAsString2);

        var gallonsUsed = closestStationDistance2/KPG;
        var costOfJourney2 = (((gallonsUsed*ALIG)*fuelcost)/100);
        $scope.costOfJourney2 = costOfJourney2.toFixed(2);

        //Calculate the amount saved
        var amountSaved = ($scope.costOfJourney2-$scope.costOfJourney);
        $scope.amountSaved = amountSaved.toFixed(2);

        showPopUp(stationNumber);

      }else{
        $scope.showPreferencesPopup("ERROR - Edit preferences first");
      }

    }

    //  *************************
    //  FOR CLOSEST STATION POP UP
    //  *************************

    function showPopUp(sNumber) {
      // An elaborate, custom popup
      var stationNumberForDirections = sNumber;
      var myPopup = $ionicPopup.show({
        scope: $scope,
        title:$scope.stationFound.closestStation.Name,
        templateUrl: 'templates/closestStationPopup.html',
        buttons: [
          { text: 'Cancel',
            type: 'button-assertive'},
          {
            text: '<b>Directions</b>',
            type: 'button-positive',
            onTap: function(e) {
              getDirections(stationNumberForDirections);
            }
          }
        ]
    });

      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });

     };

     //  *************************
     //  FOR PREFER POP UP
     //  *************************

      $scope.showPreferencesPopup = function(message){
        var prefPopup = $ionicPopup.show({
          scope: $scope,
          title: message,
          templateUrl: 'templates/preferencesPopup.html',
          buttons: [
            { text: 'Cancel',
              type: 'button-assertive'},
            {
              text: 'Update',
              type: 'button-balanced',
              onTap: function(e) {
                console.log("preferences saved");
              }
            }
          ]
      });

        myPopup.then(function(res) {
          console.log('Tapped!', res);
        });

       };

       //DEFINE THE FUEL PRICE AND MPG FOR CALC ROUTE PRICE
       $scope.defineFuelPrice = function(optionSelected) {
          $scope.averageFuelPrice = optionSelected;
      };

        $scope.defineMPG = function(optionSelected) {
           $scope.KPG = optionSelected;
       };

     /************************************************
     FOR GETTING DIRECTIONS TO THE STATION USING THE POPUP
     /************************************************/

     function getDirections(stationNumber){
       $scope.directionsPresent = true;
       var directionsService = new google.maps.DirectionsService;
       $scope.directionsDisplay = new google.maps.DirectionsRenderer;
       $scope.directionsDisplay.setMap($scope.map);
       $scope.directionsDisplay.setPanel(document.getElementById('directions-panel'));
       var lat = data[stationNumber].Position.Lat;
       var lng = data[stationNumber].Position.Lng;
       var coordinate = new google.maps.LatLng(lat,lng);

       directionsService.route({
         //There is a delay from finding my position
         //this is therefore causing a lag and resulting
         //in having to tap the button twice
         origin: $scope.myLatLngForPosition,
         destination: coordinate,
         travelMode: 'DRIVING'
       }, function(response, status) {
         if (status === 'OK') {
           $scope.directionsPresent = true;
           var distance = response.routes[0].legs[0].distance.text;
           var duration = response.routes[0].legs[0].duration.text;
           $scope.directionsDisplay.setDirections(response);
         } else {
           alert('Directions request failed due to ' + status);
         }
       });



     }
     //  *******************************************
     //  FOR GETTING DIRECTIONS TO A MARKER
     //  *******************************************
     var directionsService = new google.maps.DirectionsService;
     $scope.directionsDisplay = new google.maps.DirectionsRenderer;
     $scope.directionsDisplay.setMap($scope.map);
     $scope.directionsDisplay.setPanel(document.getElementById('directions-panel'));



     //****************************************************
     //FOR CLEARING THE DIRECTIONS
     //****************************************************

     $scope.clearDirections = function(){
       $scope.directionsPresent = false;
       $scope.directionsDisplay.setMap(null);
     }
    $scope.searchForClosestStation = function(){
      getDistances(findClosestStation);
    }

    /*****************************************************
    //  FOR GOING BACK TO THE HOMEPAGE
    /****************************************************/
    $scope.goBackToHomepage = function(){
        $state.go('app.mainMap');
    }

});
