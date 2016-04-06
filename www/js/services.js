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

app.factory('User', [ 'Resource', 'apiUrl', function($resource, apiUrl ) {
  return $resource(apiUrl + '/users/:token', { token: "@token" });
}]);
app.factory('UserTour', [ 'Resource', 'apiUrl', function( $resource, apiUrl ) {
  return $resource(apiUrl + '/user_tours/:id', { id: "@id" });
}]);
app.factory('UserTourPlace', [ 'Resource', 'apiUrl', function( $resource, apiUrl) {
  return $resource(apiUrl + '/user_tour_places/:id', { id: "@id" });
}]);
app.factory('UserTourChallenge', [ 'Resource', 'apiUrl', function( $resource, apiUrl ) {
  return $resource(apiUrl + '/user_tour_challenges/:id', { id: "@id" });
}]);
app.factory('Tag', [ 'Resource', 'apiUrl', function( $resource, apiUrl ) {
  return $resource(apiUrl + '/tags/:id', { id: "@id" });
}]);
app.factory('Survey', [ 'Resource', 'apiUrl', function( $resource, apiUrl ) {
  return $resource(apiUrl + '/surveys/:id', { id: "@id" });
}]);




app.factory('ToursService', function($http, apiUrl) {
  var url = apiUrl + "/tours";
  return {
    tours: function() {
      return $http.get(url)
    },
    getTour: function(id) {
      return $http.get(url + '/' + id)
    }
  }
});
app.factory('ChallengeService', function($http, apiUrl) {
  return {
    challenges: function(placeId) {
      return $http.get(apiUrl + "/places/" + placeId + "/challenges")
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
