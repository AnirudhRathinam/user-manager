

angular.module('myApp', 
    [
        'appRoutes', 
        'userControllers', 
        'userServices', 
        'mainController',
        'authservice',
        'managementController'
    ])
//configures app to intercept all http requests with facroty
.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptor');
});