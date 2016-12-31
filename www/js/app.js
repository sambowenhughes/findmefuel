angular.module('starter', ['ionic', 'starter.controllers','firebase', 'starter.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/map',
    abstract: true,
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })

  .state('app.mainMap', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
});
