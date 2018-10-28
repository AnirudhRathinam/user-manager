
var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){

    $routeProvider
    
    .when('/', {
        templateUrl: 'app/views/pages/home.html'
    })

    .when('/about', {
        templateUrl: 'app/views/pages/about.html'
    })

    .when('/signup',{
        templateUrl: 'app/views/pages/users/signup.html',
        controller: 'signupController',
        controllerAs: 'register',
        loggedin: false
    })
    
    .when('/login', {
        templateUrl: 'app/views/pages/users/login.html',
        loggedin: false
    })

    .when('/logout', {
        templateUrl: 'app/views/pages/users/logout.html',
        loggedin: true
    })

    .when('/profile',{
        templateUrl: 'app/views/pages/users/profile.html',
        loggedin: true
    })

    .when('/management', {
        templateUrl: 'app/views/pages/management/management.html',
        controller: 'managementcontroller',
        controllerAs: 'management',
        loggedin: true,
        permission: ['admin', 'moderator']
    })

    .otherwise({redirectTo: '/'});
    
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

});

app.run(['$rootScope', '$location', 'Auth', 'User', function($rootScope, $location ,Auth, User){
    $rootScope.$on('$routeChangeStart', function(event, next, current){
        if(next.$$route !== undefined){
            //if not authenticated, redirect to home
            //for pages: /profle, /logout where user must be authenticated
            if(next.$$route.loggedin == true){
                if(!Auth.isLoggedIn()){
                    event.preventDefault();
                    $location.path('/');
                } else if(next.$$route.permission){
                    //Check if user is admin or moderator
                    User.getPermission().then(function(data){
                        //If user not admin or mod prevent them from viewing page
                        if(next.$$route.permission[0] !== data.data.permission){
                            if(next.$$route.permission[1] !== data.data.permission){
                                event.preventDefault();
                                $location.path('/');
                            }
                        }
                    });
                }
            //if authenticated, redirect to /profile
            //for pages: /login, /signup where user must be authenticated
            } else if (next.$$route.loggedin == false) {
                if(Auth.isLoggedIn()){
                    event.preventDefault();
                    $location.path('/profile');
                }
            //pages where authentication does not matter
            //for pages: home or /about
            } else {
                // enter code here
            }
        }
    });
}]);