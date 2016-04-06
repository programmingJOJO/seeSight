var app = angular.module('starter.controllers', []);

app.controller('IntroCtrl', function($scope, $rootScope, $cordovaNetwork, $state, $localstorage, $ionicSlideBoxDelegate, User, tags) {
  $scope.tags = tags;

  document.addEventListener("deviceready", function() {
    $scope.isOnline = $cordovaNetwork.isOnline();
    //$scope.$apply();

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      $scope.isOnline = true;
      //$scope.$apply();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      $scope.isOnline = false;
      //$scope.$apply();
    })
  }, false);

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

    if($localstorage.get('seeSight_did_tutorial') === "true") {
      $scope.startApp();
    }
  });

  $scope.tag_ids = [];
  // Called to navigate to the main app
  $scope.startApp = function() {
    // Set a flag that we finished the tutorial
    $localstorage.set('seeSight_did_tutorial', true);
    // Save tag ids
    if ($localstorage.get("seeSight_user_token") && $localstorage.get("seeSight_user_token") != null && $localstorage.get("seeSight_user_token") != 'undefined' && $localstorage.get("seeSight_user_token") !== undefined) {
      if ($scope.tag_ids.length > 0) {
        User.get({token: $localstorage.get("seeSight_user_token")}, function (user) {
          user.tag_ids = $scope.tag_ids;
          user.$save({token: $localstorage.get("seeSight_user_token")});
        });
      }
    }
    $state.go('app.home');
  };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

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

app.controller('AppCtrl', function($scope, $rootScope, $state, $localstorage, $filter, $ionicPopup, $cordovaNetwork, UserTour, User, UserTourChallenge, tours) {
  $scope.platform = ionic.Platform.platform();
  $scope.tours = tours.data;

  var deploy = new Ionic.Deploy();
  // Update app code with new release from Ionic Deploy
  $scope.doUpdate = function() {
    deploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  $scope.checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    deploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $scope.hasUpdate = hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
  };

  document.addEventListener("deviceready", function() {
    $scope.isOnline = $cordovaNetwork.isOnline();
    //$scope.$apply();

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      $scope.isOnline = true;
      //$scope.$apply();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      $scope.isOnline = false;
      //$scope.$apply();
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
      if ($scope.tags && $scope.tags.length > 0) {
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

app.controller('SurveyCtrl', function($log, $scope, $localstorage, Survey) {
  $scope.range = function(min, max) {
    var input = [];
    for (var i = min; i <= max; i++) {
      input.push(i);
    }
    return input;
  };

  // Form data
  $scope.data = {
    gender: null,
    age: null,
    how_many: 2,
    how_intentional: 2,
    player_type_killer: false,
    player_type_achiever: false,
    player_type_explorer: false,
    player_type_socializer: false,

    game_type_conflict_1: false,
    game_type_conflict_2: false,
    game_type_competition_1: false,
    game_type_competition_2: false,
    game_type_self_expression_1: false,
    game_type_self_expression_2: false,
    game_type_cooperation_1: false,
    game_type_cooperation_2: false,
    game_type_coordination_1: false,
    game_type_coordination_2: false,

    gamification_tutorial: false,
    gamification_prefs: false,
    gamification_fast_start: '',
    gamification_challenges_like: 2,
    gamification_hints_like: 2,
    gamification_give_feedback_like: 2,
    gamification_given_feedback_like: 2,
    gamification_rewards_like: 2,
    gamification_progress_like: 2,
    using_app: 2,
    comment: ''
  };

  $scope.store_data = function(finished) {
    $localstorage.setObject('seesight_evaluation_survey', $scope.data);

    if (finished) {
      var survey = new Survey($scope.data);
      console.log(survey);
      survey.$save({token: $localstorage.get("seeSight_user_token")}, function (survey, headers) {

      });
    }
  };

  $scope.playerTypes = [
    { text: "Ich profiliere mich gerne in Wettkämpfen mit anderen Spielern.", name: 'player_type_killer'},
    { text: "Ich versuche mich oft in Spielen zu perfektionieren oder alles zu erreichen.", name: 'player_type_achiever'},
    { text: "Ich erkunde gerne noch unentdeckte Spielewelten oder -abschnitte.", name: 'player_type_explorer' },
    { text: "Ich interagiere in Spielen am Liebsten mit meinen Freunden.", name: 'player_type_socializer' }
  ];

  $scope.gameTypes = [
    { text: "Leichtathletik oder andere Wettkampfsportarten", name: 'game_type_competition_1' },
    { text: "Brettspiele wie Schach oder Risiko, Strategiespiele", name: 'game_type_conflict_2' },
    { text: "Einzeltraining im Sport, Bouldern", name: 'game_type_self_expression_1' },
    { text: "Spiele, welche temporäre Zusammenarbeit anbieten oder erfordern (Bosskämpfe in MMORPGs)", name: 'game_type_coordination_2' },
    { text: "Spiele mit Highscore, Autowettrennen", name: 'game_type_competition_2' },
    { text: "Action-Adventures oder andere Single-Player Spiele", name: 'game_type_self_expression_2' },
    { text: "Fitnesstraining mit Freunden, Runtastic mit Cheering", name: 'game_type_coordination_1' },
    { text: "Kooperative Spiele wie Pandemie oder Scotland Yard", name: 'game_type_cooperation_2' },
    { text: "Ballsportarten wie Fußball, Volleyball oder Tennis", name: 'game_type_conflict_1' },
    { text: "Meisterschaften mit dem Team oder dem Clan", name: 'game_type_cooperation_1' }
  ];

  $scope.menuItems = [
    { text: "Den Schnellstart", value: "menu_fast_select" },
    { text: "Manuell ausgewählt", value: "menu_manuel_select" },
    { text: "Beides ausgetestet", value: "menu_both_select" }
  ];

  $scope.$on('$ionicView.enter', function(){
    $scope.data = $localstorage.getObject('seesight_evaluation_survey', $scope.data);
  });
});

app.controller('ToursCtrl', function($log, $scope, $http, $localstorage, tours, UserTour) {
  $scope.tours = tours.data;
  $scope.$on('$ionicView.enter', function(){
    UserTour.query({
      token: $localstorage.get("seeSight_user_token")
    }).$promise.then(function(response) {
      $scope.user_tours = response;
      console.log($scope.user_tours)
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

  var mainMarker = {
    lat: $scope.tour.city.lat,
    lng: $scope.tour.city.lng,
    focus: true,
    message: $scope.tour.city.name,
    draggable: false
  };
  angular.extend($scope, {
    center: {
      lat: $scope.tour.city.lat,
      lng: $scope.tour.city.lng,
      zoom: 14
    },
    markers: [],
    defaults: {
      zoomControl: false,
      tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileLayerOptions: {
        opacity: 0.9,
        detectRetina: true,
        reuseTiles: true
      }
    }
  });
  $scope.markers.push(mainMarker);

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
      tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileLayerOptions: {
        opacity: 0.9,
        detectRetina: true,
        reuseTiles: true
      }
    }
  });
  $scope.markers.push(mainMarker);
  for (var i = 0; i < tour.data.tour_places.length; i++) {
    if (tour.data.tour_places[i].id == parseInt($stateParams.placeId)) { continue; }
    $scope.markers.push({
      lat: tour.data.tour_places[i].place.lat,
      lng: tour.data.tour_places[i].place.lng,
      focus: false,
      message: $scope.place.name
    })
  }

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
      $scope.takeHint(item.id);
    }
  };
  $scope.isItemShown = function(item) {
    return $scope.shownItem === item;
  };

  $scope.takeHint = function(hint_id) {
    UserTourChallenge.get({
      id: 1, // Not relevant, but must be send vor a successful request
      token: $localstorage.get("seeSight_user_token"),
      challenge_id: $scope.challenge.id,
      user_tour_id: $localstorage.get("selected_user_tour")
    }, function(userTourChallenge) {
      userTourChallenge.hint_id = hint_id;
      userTourChallenge.$save({token: $localstorage.get("seeSight_user_token")}, function(userTourChallenge) {
        $scope.user_tour_challenge = userTourChallenge;
      });
    });
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
