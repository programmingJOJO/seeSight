app.factory( 'Resource', [ '$resource', function( $resource ) {
  return function( url, params, methods ) {
    var defaults = {
      update: { method: 'put', isArray: false },
      create: { method: 'post' }
    };
    methods = angular.extend( defaults, methods );
    var resource = $resource( url, params, methods );
    resource.prototype.$save = function() {
      if ( !this.id ) {
        return this.$create.apply(this, arguments);
      }
      else {
        return this.$update.apply(this, arguments);
      }
    };
    return resource;
  };
}]);

app.factory('User', function($resource, $localstorage) {
  return $resource('http://localhost:3000/users/:token', {token: $localstorage.get("seeSight_user_token")});
});
app.factory('UserTour', [ 'Resource', function( $resource ) {
  return $resource('http://localhost:3000/user_tours/:id', { id: "@id" });
}]);
app.factory('UserTourPlace', [ 'Resource', function( $resource ) {
  return $resource('http://localhost:3000/user_tour_places/:id', { id: "@id" });
}]);
app.factory('UserTourChallenge', [ 'Resource', function( $resource ) {
  return $resource('http://localhost:3000/user_tour_challenges/:id', { id: "@id" });
}]);





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

app.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);
