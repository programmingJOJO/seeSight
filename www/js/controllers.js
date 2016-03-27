var app = angular.module('starter.controllers', []);

app.controller('AppCtrl', function($scope, $localstorage, $filter, UserTour, UserTourChallenge) {
  $scope.platform = ionic.Platform.platform();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    UserTour.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
      $scope.user_tours = response;
      $scope.conmpleted_user_tours = $filter('filter')($scope.user_tours, { completed: true }, true);
    });

    UserTourChallenge.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
      $scope.user_tour_challenges = response;
      $scope.unsolved_user_tour_challenges = $filter('filter')($scope.user_tour_challenges, { state: 3 }, false);
    });
  });

});

app.controller('ToursCtrl', function($log, $scope, $http, $localstorage, tours, UserTour) {
  $scope.tours = tours.data;
  $scope.$on('$ionicView.enter', function(){
    UserTour.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
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
    if ($localstorage.get("selected_user_tour") && $localstorage.get("selected_user_tour") != null && $localstorage.get("selected_user_tour") != 'undefined' && $localstorage.get("selected_user_tour") !== undefined) {
      UserTour.get({
        token: $localstorage.get("seeSight_user_token"),
        id: $localstorage.get("selected_user_tour")
      }).$promise.then(function(response) {
        $scope.user_tour = response;
        $scope.user_tour_places = $scope.user_tour.user_tour_places;
      });
    }
  });

  $scope.userTourHasPause = function() {
    return ($scope.user_tour && $scope.user_tour.user_tour_places[0].visited);
  };

  $scope.isPlaceVisited = function(tour_place) {
    if ($scope.userTourHasPause()) {
      if (!tour_place) {
        return true; // user_tour has already no visited places
      }
      var found = $filter('filter')($scope.user_tour_places || [], { place_id: parseInt(tour_place.place_id) }, true);
      if (found.length) {
        return found[0].visited;
      } else {
        return false;
      }
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
    console.log('NEW USER TOUR');
    var userTour = new UserTour({tour_id: $scope.tour.id, token: $localstorage.get("seeSight_user_token") });
    userTour.$save(function (userTour, headers) {
      console.log('USER TOUR SAVED');
      $localstorage.set("selected_user_tour", userTour.id);
    });
  };
});

app.controller('PlaceCtrl', function($log, $scope, $ionicModal, ChallengeService, UserTourChallenge, $localstorage, $filter, $stateParams, $timeout, $ionicLoading, UserTourPlace, tour) {
  var found = $filter('filter')(tour.data.tour_places, { id: parseInt($stateParams.placeId) }, true);
  if (found.length) {
    $scope.tour_place = found[0];
    $scope.place = $scope.tour_place.place;
    $scope.tour = tour.data;
    $scope.nextPlaceId = $scope.tour_place.id + 1;
  } else {
    $scope.tour_place = 'Not found';
  }

  $scope.placeIsVisited = function(tour_place_id) {
    if ($localstorage.get("selected_user_tour") && $localstorage.get("selected_user_tour") != null && $localstorage.get("selected_user_tour") != 'undefined' && $localstorage.get("selected_user_tour") !== undefined) {
      UserTourPlace.get({
        id: tour_place_id, // Not relevant, but must be send vor a successful request
        token: $localstorage.get("seeSight_user_token"),
        user_tour_id: $localstorage.get("selected_user_tour"),
        place_id: $scope.place.id
      }, function(userTourPlace) {
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

  // Challenge

  $scope.correct_answer = false;
  $scope.show_notification = false;
  $scope.show_hint = false;
  $scope.rating = 1;
  $scope.$on('$ionicView.enter', function(){
    var promise = ChallengeService.challenges($scope.place.id);
    promise.then(
        function(payload) {
          $scope.challenge = payload.data[0];
          if($scope.challenge) {
            $scope.rating = $scope.challenge.difficulty;
            UserTourChallenge.get({
              id: 1, // Not relevant, but must be send vor a successful request
              token: $localstorage.get("seeSight_user_token"),
              challenge_id: $scope.challenge.id,
              user_tour_id: $localstorage.get("selected_user_tour")
            }, function(userTourChallenge) {
              $scope.user_tour_challenge = userTourChallenge;
            });
          }
        },
        function(errorPayload) {
          $log.error('failure loading tours', errorPayload);
        });
  });

  $scope.challengeExists = function() {
    return ($scope.challenge && $scope.challenge.id);
  };

  $scope.challengeUnsolved = function() {
    return ($scope.challengeExists() && $scope.user_tour_challenge && $scope.user_tour_challenge.state != 3);
  };

  $scope.challengeSolved = function() {
    return ($scope.challengeExists() && $scope.user_tour_challenge && $scope.user_tour_challenge.state == 3);
  };

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
    $scope.correct_answer = '';
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.showChallenge = function() {
    $scope.modal.show();
  };

  $scope.toggleItem= function(item) {
    if ($scope.isItemShown(item)) {
      $scope.shownItem = null;
    } else {
      $scope.shownItem = item;
    }
  };
  $scope.isItemShown = function(item) {
    return $scope.shownItem === item;
  };

  // Perform the login action when the user submits the login form
  $scope.answerChallenge = function() {
    var correct_answer = $filter('filter')($scope.challenge.challenge_solutions, { truth: true }, true);
    if(correct_answer.length) {
      $scope.correct_answer = $scope.challengeData.answer  && (correct_answer[0].answer.toLowerCase() == $scope.challengeData.answer.toLowerCase());
    }
    $scope.show_notification = true;
    if (!$scope.correct_answer) {
      $scope.show_hint = true;
    }

    UserTourChallenge.get({
      id: 1, // Not relevant, but must be send vor a successful request
      token: $localstorage.get("seeSight_user_token"),
      challenge_id: $scope.challenge.id,
      user_tour_id: $localstorage.get("selected_user_tour")
    }, function(userTourChallenge) {
      userTourChallenge.answer = $scope.challengeData.answer;
      userTourChallenge.$save({token: $localstorage.get("seeSight_user_token")}, function(userTourChallenge) {
        $scope.user_tour_challenge = userTourChallenge;
      });
    });

    $timeout(function() {
      $scope.show_notification = false;
      if ($scope.correct_answer) {
        $scope.closeChallenge();
      }
    }, 3000);
  };
});

app.controller('TourFinishCtrl', function($scope, $filter, $localstorage, UserTour, UserTourChallenge, tour) {
  $scope.rating = 2;
  if ($localstorage.get("selected_user_tour") && $localstorage.get("selected_user_tour") != null && $localstorage.get("selected_user_tour") != 'undefined' && $localstorage.get("selected_user_tour") !== undefined) {
    UserTour.get({
      token: $localstorage.get("seeSight_user_token"),
      id: $localstorage.get("selected_user_tour")
    }, function(userTour) {
      $scope.user_tour_challenges = userTour.user_tour_challenges;
      $scope.unsolved_user_tour_challenges = $filter('filter')(userTour.user_tour_challenges, { state: 3 }, false);

      userTour.completed = true;
      userTour.$save({token: $localstorage.get("seeSight_user_token")});
    });
  }

  $scope.saveRatingToServer = function(rating) {
    if ($localstorage.get("selected_user_tour") && $localstorage.get("selected_user_tour") != null && $localstorage.get("selected_user_tour") != 'undefined' && $localstorage.get("selected_user_tour") !== undefined) {
      UserTour.get({
        token: $localstorage.get("seeSight_user_token"),
        id: $localstorage.get("selected_user_tour")
      }, function (userTour) {
        userTour.rating = rating;
        userTour.$save({token: $localstorage.get("seeSight_user_token")});
      });
    }
  };
});
