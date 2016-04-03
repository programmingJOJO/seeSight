var app = angular.module('starter.controllers', []);

app.controller('IntroCtrl', function($scope, $rootScope, $state, $localstorage, $ionicSlideBoxDelegate, User, tags) {

  $scope.$on('$ionicView.enter', function(e) {
    if ($localstorage.get("seeSight_user_token") && $localstorage.get("seeSight_user_token") != null && $localstorage.get("seeSight_user_token") != 'undefined' && $localstorage.get("seeSight_user_token") !== undefined) {
      User.get({token: $localstorage.get("seeSight_user_token")}, function (user) {
        $localstorage.set("seeSight_user_token", user.token);
      });
    } else {
      // Create guest
      var user = new User({});
      user.$save(function (user, putResponseHeaders) {
        //user => saved user object
        //putResponseHeaders => $http header getter
        $localstorage.set("seeSight_user_token", user.token);
      });
    }
    $scope.tags = tags;

    // Called to navigate to the main app
    $scope.startApp = function() {
      // Set a flag that we finished the tutorial
      $localstorage.set('seeSight_did_tutorial', true);
      // Save tag ids
      if ($localstorage.get("seeSight_user_token") && $localstorage.get("seeSight_user_token") != null && $localstorage.get("seeSight_user_token") != 'undefined' && $localstorage.get("seeSight_user_token") !== undefined) {
        User.get({token: $localstorage.get("seeSight_user_token")}, function(user) {
          user.tag_ids = $scope.tag_ids;
          user.$save({token: $localstorage.get("seeSight_user_token")});
        });
        $state.go('app.home');
      }
    };

    if($localstorage.get('seeSight_did_tutorial') === "true") {
      $scope.startApp();
    }

    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };

    $scope.tag_ids = [];
    $scope.collectTags = function(tag_id) {
      var i = $scope.tag_ids.indexOf(tag_id);
      if (i === -1) {
        $scope.tag_ids.push(tag_id);
      } else {
        $scope.tag_ids.splice(i, 1)
      }
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };
  });
});

app.controller('AppCtrl', function($scope, $state, $localstorage, $filter, $ionicPopup, $cordovaNetwork, UserTour, User, UserTourChallenge, tours) {
  $scope.platform = ionic.Platform.platform();
  $scope.tours = tours.data;
  document.addEventListener("deviceready", function() {
    $scope.isOnline = $cordovaNetwork.isOnline();
    $scope.$apply();

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      $scope.isOnline = true;
      $scope.$apply();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      $scope.isOnline = false;
      $scope.$apply();
    })

  }, false);

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    if ($localstorage.get("seeSight_user_token") && $localstorage.get("seeSight_user_token") != null && $localstorage.get("seeSight_user_token") != 'undefined' && $localstorage.get("seeSight_user_token") !== undefined) {
      User.get({token: $localstorage.get("seeSight_user_token")}, function (user) {
        $scope.tags = user.tags;
      });
    }
    UserTour.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
      $scope.user_tours = response;
      $scope.completed_user_tours = $filter('filter')($scope.user_tours, { completed: true }, true);
      if ($scope.tags.length > 0) {
        if ($filter('filter')($scope.tags, { name: 'Brücken' }, true).length || $filter('filter')($scope.tags, { name: 'Flüsse' }, true).length) {
          $scope.fast_start_user_tours = $filter('filter')($scope.user_tours, { tour: { tags: { name: 'Brücken' || 'Flüsse' } } }, true);
        } else if ($filter('filter')($scope.tags, { name: 'Burgen' }, true).length || $filter('filter')($scope.tags, { name: 'Fachwerkhäuser' }, true).length) {
          $scope.fast_start_user_tours = $filter('filter')($scope.user_tours, { tour: { tags: { name: 'Burgen' || 'Fachwerkhäuser' } } }, true);
        }
      }
      $scope.fast_start_user_tours = $scope.fast_start_user_tours || $scope.user_tours;
    });
    UserTourChallenge.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
      $scope.user_tour_challenges = response;
      $scope.unsolved_user_tour_challenges = $filter('filter')($scope.user_tour_challenges, { state: 3 }, false);
    });
  });

  $scope.toIntro = function(){
    $localstorage.set('seeSight_did_tutorial', false);
    $state.go('intro');
  };

  $scope.showInfo = function() {
    $ionicPopup.alert({
      title: 'Information',
      template: 'Diese Anwendung enstand im Rahmen der Masterarbeit von Johannes Kölbl.<br>Studiengang: Informatik.<br>Hochschule: Technische Hochschule Nürnberg Georg Simon Ohm <br>E-Mail:<br> <a href="mailto:koelbljo45514@th-nuernberg.de">koelbljo45514@th-nuernberg.de</a>'
    });
  };

  $scope.showDismiss = function() {
    $ionicPopup.alert({
      title: 'Information',
      template: 'Diese Funktion ist zum jetzigen Zeitpunkt noch nicht verfügbar'
    });
  };

  $scope.selectUserTour = function(user_tour_id) {
    $localstorage.set("selected_user_tour", user_tour_id);
  }
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
      }, function(user_tour) {
        $scope.user_tour = user_tour;
        $scope.user_tour_places = $scope.user_tour.user_tour_places;
      });
    }
  });

  $scope.userTourHasPause = function() {
    return ($scope.user_tour && $filter('filter')($scope.user_tour_places || [], { visited: true }, true).length);
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
    var userTour = new UserTour({tour_id: $scope.tour.id, token: $localstorage.get("seeSight_user_token") });
    userTour.$save(function (userTour, headers) {
      $localstorage.set("selected_user_tour", userTour.id);
    });
  };
});

app.controller('PlaceCtrl', function($log, $scope, $ionicModal, $state, $ionicHistory, ChallengeService, UserTourChallenge, $localstorage, $filter, $stateParams, $timeout, $ionicLoading, UserTourPlace, tour) {
  $scope.tour = tour.data;

  $scope.objectIndexOf = function(arr, obj){
    for(var i = 0; i < arr.length; i++){
      if(angular.equals(arr[i], obj)){
        return i;
      }
    }
    return -1;
  };

  var found = $filter('filter')(tour.data.tour_places, { id: parseInt($stateParams.placeId) }, true);
  if (found.length) {
    $scope.tour_place = found[0];
    $scope.place = $scope.tour_place.place;
    $scope.index_of_place = $scope.objectIndexOf(tour.data.tour_places, $scope.tour_place);
    $scope.nextPlaceId = $scope.tour_place.id + 1;
    $scope.tour_range = ($scope.index_of_place + 1) / tour.data.tour_places.length * 100
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

  $scope.goHome = function() {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.home');
  };

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

  $scope.toggleItem = function(item) {
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

app.controller('TourFinishCtrl', function($scope, $filter, $localstorage, $state, $ionicHistory, UserTour) {
  $scope.rating = 3;
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

  $scope.goHome = function() {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.home');
  };

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
