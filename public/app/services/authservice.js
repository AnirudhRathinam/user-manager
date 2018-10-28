
angular.module('authservice', [])

.factory('Auth', function($http, AuthToken){
    var authFactory = {};
    //Auth.create
    authFactory.login = function(data){
        return $http.post('/api/authenticate', data).then(function(authdata){
            //token: authdata.data.token
            AuthToken.toggleToken(authdata.data.token);
            return authdata;
        });
    };
    //Auth.isLoggedIn
    authFactory.isLoggedIn = function() {
        if(AuthToken.getToken()){
            return true;
        } else {
            return false;
        }
    };

    //Auth.getUser - gets user from decrypted token
    authFactory.getUser = function(){
        if(AuthToken.getToken()){
            return $http.post('/api/currentuser');
        } else {
            $q.reject({message: 'Error: Token not found'});
        }
    };

    //Auth.logout
    authFactory.logout = function(data){
        AuthToken.toggleToken()
    };

    return authFactory;
})

.factory('AuthToken', function($window){
    var authTokenFactory = {};

    //AuthToken.toggleToken(token);
    //Toggles token to val or null. Used for login/logout
    authTokenFactory.toggleToken = function(token){
        //$window.localStorage.setItem('token', token);
        if(token) {
            $window.localStorage.setItem('token', token);
        } else {
            $window.localStorage.removeItem('token');
        }
    };

    //Returns auth token
    authTokenFactory.getToken = function(){
        return window.localStorage.getItem('token');
    }

    return authTokenFactory;
})

//factory attaches tokens for every request
.factory('AuthInterceptor', function(AuthToken){
    var authInterceptorFactory = {};

    authInterceptorFactory.request = function(config){
        var token = AuthToken.getToken();
        //if token exists attach it to header
        if(token){
            config.headers['x-access-token'] = token;
        }
        return config;
    };

    return authInterceptorFactory;
});