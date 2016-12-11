angular.module('starter.controllers', ['ionic'])

.controller('MapCtrl', function($scope, $state, $ionicLoading,  $ionicActionSheet, $ionicPopover) {

  $scope.stateChanger = function(){
    $state.go('app.mainMap');
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



    */
    $scope.demo = 'ios';
    $scope.setPlatform = function(p) {
      document.body.classList.remove('platform-ios');
      document.body.classList.remove('platform-android');
      document.body.classList.add('platform-' + p);
      $scope.demo = p;
    }

   //*******************************************
   //      FOR SETTING UP MAP
   //*******************************************
   $scope.mapCreated = function(map) {
     $scope.map = map;
     directionsDisplay.setMap($scope.map);
   };

  //  *******************************************
  //  FOR GETTING MY LOCATION AND DISPLAYING MARKERS
  //  *******************************************
   $scope.followMe = function () {
     if (!$scope.map) {
       return;
     };
     createMarker();
     $scope.watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 3000000, enableHighAccuracy: true });

      function onSuccess(position) {
        var myLatlng = {lat: position.coords.latitude, lng: position.coords.longitude};
        $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        $scope.marker.setPosition(myLatlng);
      };

      function createMarker(){
        var meImage = 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/green.png';
        $scope.marker = new google.maps.Marker({
          map: $scope.map,
          position: null,
          icon: meImage
        });
      }

      // onError Callback receives a PositionError object
      //
      function onError(error) {
          alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
        }
      };
});
