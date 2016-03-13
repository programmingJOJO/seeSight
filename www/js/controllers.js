var app = angular.module('starter.controllers', []);

app.factory('ToursService', function($http) {
  var url = "http://localhost:3000/tours";

  return {
    tours: function() {
      return $http.get(url)
    },
    getTour: function(id) {
      return $http.get(url + '/' + id)
    }
  }
});

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $ionicLoading) {
  $scope.platform = ionic.Platform.platform();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('ToursCtrl', function($log, $scope, $http, ToursService) {
  var promise = ToursService.tours;
  promise().then(
  function(payload) {
    $scope.tours = payload.data;
  },
  function(errorPayload) {
    $log.error('failure loading movie', errorPayload);
  });
})

.controller('TourCtrl', function($scope, tour) {
  console.log(tour.data);
  $scope.tour = tour.data;

  angular.extend($scope, {
    center: {
      lat: 49.45052,
      lng: 11.08048,
      zoom: 12
    },

    defaults: {
      zoomControl: false
    },

    layers: {
      baselayers: {
        osm: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        }
      }
    }
  });

  $scope.SkipItem = function(item) {
    item.name = "Edited Item"
  }
});
