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

app.factory('ChallengeService', function($http) {
  return {
    challenges: function(placeId) {
      return $http.get("http://localhost:3000/places/" + placeId + "/challenges")
    }
  }
});

app.controller('AppCtrl', function($scope, $http) {
  $scope.platform = ionic.Platform.platform();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
});

app.controller('ToursCtrl', function($log, $scope, $http, ToursService, $localstorage) {
  var promise = ToursService.tours;
  console.log('UUUUUUUU')
  console.log(promise)
  promise().then(
  function(payload) {
    $scope.tours = payload.data;
  },
  function(errorPayload) {
    $log.error('failure loading tours', errorPayload);
  });
});

app.controller('TourCtrl', function($scope, tour) {
  console.log(tour.data);
  $scope.tour = tour.data;

  angular.extend($scope, {
    center: {
      lat: $scope.tour.city.lat,
      lng: $scope.tour.city.lng,
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

app.controller('PlaceCtrl', function($log, $scope, $ionicModal, ChallengeService, $filter, $stateParams, $timeout, $ionicLoading, tour) {
  var found = $filter('filter')(tour.data.tour_places, { id: parseInt($stateParams.placeId) }, true);
  if (found.length) {
    $scope.tour_place = found[0];
    $scope.place = $scope.tour_place.place;
    $scope.tour = tour.data;
    $scope.nextPlaceId = $scope.tour_place.id + 1;
  } else {
    $scope.tour_place = 'Not found';
  }

  var mainMarker = {
    lat: $scope.place.lat,
    lng: $scope.place.lng,
    focus: true,
    message: $scope.place.name,
    draggable: false
  };
  angular.extend($scope, {
    center: {
      lat: $scope.place.lat,
      lng: $scope.place.lng,
      zoom: 17
    },
    markers: [],
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
  $scope.markers.push(mainMarker);

  $scope.delay = false;
  $timeout(function(){
    $scope.delay = true;
  }, 1000);

  $scope.rating = 1;
  var promise = ChallengeService.challenges($scope.place.id);
  promise.then(
    function(payload) {
      $scope.challenge = payload.data[0];
      $scope.rating = $scope.challenge.difficulty;
    },
    function(errorPayload) {
      $log.error('failure loading tours', errorPayload);
  });
  // Form data for the login modal
  $scope.challengeData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/challenge.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeChallenge = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.showChallenge = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.answerChallenge = function() {
    console.log('Answering Challenge', $scope.challengeData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeChallenge();
    }, 1000);
  };
});

app.controller('TourFinishCtrl', function($scope, tour) {
  $scope.saveRatingToServer = function(rating) {
    // TODO: http to server
  };

});
