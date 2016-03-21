var app = angular.module('starter.controllers', []);

app.controller('AppCtrl', function($scope) {
  $scope.platform = ionic.Platform.platform();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

});

app.controller('ToursCtrl', function($log, $scope, $http, $localstorage, tours, UserTour) {
  $scope.tours = tours.data;
  $scope.$on('$ionicView.enter', function(){
    UserTour.query({token: $localstorage.get("seeSight_user_token")}).$promise.then(function(response) {
      $scope.user_tours = response;
    });
  });

  $scope.selectUserTour = function(user_tour_id) {
    $localstorage.set("selected_user_tour", user_tour_id);
  }
});

app.controller('TourCtrl', function($scope, $stateParams, $filter, $localstorage, UserTour, UserTourPlace, tour) {
  $scope.tour = tour.data;
  $scope.$on('$ionicView.enter', function(){
    if ($localstorage.get("selected_user_tour") != undefined) {
      UserTourPlace.query({token: $localstorage.get("seeSight_user_token"), user_tour_id: $localstorage.get("selected_user_tour")}).$promise.then(function(response) {
        $scope.user_tour_places = response;
      });
    }
  });

  $scope.isPlaceVisited = function(tour_place) {
    if (!tour_place) {
      return false;
    }
    var found = $filter('filter')($scope.user_tour_places || [], { place_id: parseInt(tour_place.place_id) }, true);
    if (found.length) {
      return found[0].visited;
    } else {
      return false;
    }
  };

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

  $scope.newUserTour = function() {
    var userTour = new UserTour({tour_id: $scope.tour.id, token: $localstorage.get("seeSight_user_token") });
    userTour.$save();
  };
});

app.controller('PlaceCtrl', function($log, $scope, $ionicModal, ChallengeService, $localstorage, $filter, $stateParams, $timeout, $ionicLoading, UserTourPlace, tour) {
  var found = $filter('filter')(tour.data.tour_places, { id: parseInt($stateParams.placeId) }, true);
  if (found.length) {
    $scope.tour_place = found[0];
    $scope.place = $scope.tour_place.place;
    $scope.tour = tour.data;
    $scope.nextPlaceId = $scope.tour_place.id + 1;
  } else {
    $scope.tour_place = 'Not found';
  }

  $scope.placeIsVisited = function(place) {
    if ($localstorage.get("selected_user_tour") != undefined) {
      UserTourPlace.get({id: 1, token: $localstorage.get("seeSight_user_token"), user_tour_id: $localstorage.get("selected_user_tour"), place_id: $scope.place.id}, function(userTourPlace) {
        userTourPlace.visited = true;
        userTourPlace.$save();
      });
    }
  };

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


  // Challenge


  $scope.correct_answer = false;
  $scope.show_notification = false;
  $scope.rating = 1;
  var promise = ChallengeService.challenges($scope.place.id);
  promise.then(
    function(payload) {
      $scope.challenge = payload.data[0];
      if($scope.challenge != undefined) {
        $scope.rating = $scope.challenge.difficulty;
      }
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
    //$scope.correct_answer = '';
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.showChallenge = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.answerChallenge = function() {
    var correct_answer = $filter('filter')($scope.challenge.challenge_solutions, { truth: true }, true);
    if(correct_answer.length) {
      if(correct_answer[0].answer.toLowerCase() == $scope.challengeData.answer.toLowerCase()) {
        $scope.correct_answer = true;
      } else {
        $scope.correct_answer = false;
      }
    }
    $scope.show_notification = true;
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.show_notification = false;
      //$scope.closeChallenge();
    }, 3000);
  };
});

app.controller('TourFinishCtrl', function($scope, tour) {
  $scope.saveRatingToServer = function(rating) {
    // TODO: http to server
  };

});
