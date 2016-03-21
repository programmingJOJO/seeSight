// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter',
    [
      'ionic',
      'ionic.service.core',
      'ionic.service.analytics',
      'ngResource',
      'ngCordova',
      'starter.controllers',
      'starter.directives',
      'leaflet-directive'
    ]);

app.run(function($ionicPlatform, $ionicAnalytics, $rootScope, $ionicLoading, $localstorage, $cordovaDevice, User) {
  $ionicPlatform.ready(function() {
    $rootScope.$on('loading:show', function() {
      $ionicLoading.show({template: 'Lädt'})
    });

    $rootScope.$on('loading:hide', function() {
      $ionicLoading.hide()
    });

    $ionicAnalytics.register();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if (ionic.Platform.isWebView()) {
      // the window and scripts are fully loaded, and a cordova/phonegap
      // object exists then let's listen for the deviceready
      var device = $cordovaDevice.getDevice();
      $rootScope.manufacturer = device.manufacturer;
      $rootScope.model = device.model;
      $rootScope.platform = device.platform;
      $rootScope.uuid = device.uuid;
    } else {
      // the window and scripts are fully loaded, but the window object doesn't have the
      // cordova/phonegap object, so its just a browser, not a webview wrapped w/ cordova
      $rootScope.manufacturer = 'test';
      $rootScope.model = 'test';
      $rootScope.platform = 'browser';
      $rootScope.uuid = $localstorage.get("uuid") || 16789;
    }

    // Create guest
    if ($localstorage.get("seeSight_user_token")) {
      var user = User.get({token: $localstorage.get("seeSight_user_token")}, function() {
        $localstorage.set("seeSight_user_token", user.token );
      });
    } else {
      var user = new User({});
      user.$save(function(user, putResponseHeaders) {
        //user => saved user object
        //putResponseHeaders => $http header getter
        $localstorage.set("seeSight_user_token", user.token );
      });
    }
  });
});


app.config(function($stateProvider, $urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
    })

    .state('app.tours', {
      url: '/tours',
      views: {
        'menuContent': {
          templateUrl: 'templates/tours.html',
          controller: 'ToursCtrl',
          resolve: {
            tours: function(ToursService) {
              return ToursService.tours()
            }
          }
        }
      }
    })

    .state('app.tour_detail', {
      url: '/tours/:tourId',
      views: {
        'menuContent': {
          templateUrl: 'templates/tour.html',
          controller: 'TourCtrl',
          resolve: {
            tour: function(ToursService, $stateParams) {
              return ToursService.getTour($stateParams.tourId)
            }
          }
        }
      }
    })

    .state('app.tour_start', {
      url: '/tours/:tourId/places/:placeId',
      views: {
        'menuContent': {
          templateUrl: 'templates/place.html',
          controller: 'PlaceCtrl',
          resolve: {
            tour: function(ToursService, $stateParams) {
              return ToursService.getTour($stateParams.tourId)
            }
          }
        }
      }
    })

    .state('app.tour_finish', {
      url: '/tours/:tourId/finished',
      views: {
        'menuContent': {
          templateUrl: 'templates/tour_finish.html',
          controller: 'TourFinishCtrl',
          resolve: {
            tour: function(ToursService, $stateParams) {
              return ToursService.getTour($stateParams.tourId)
            }
          }
        }
      }
    });
});

app.config(function($httpProvider) {
  $httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show');
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide');
        return response
      }
    }
  })
});
