
angular.module('userServices', [])

.factory('User', function($http){
    var userFactory = {};
    //User.create(data);
    userFactory.create = function(data){
        return $http.post('/api/users', data);
    }
    //Renew expired token
    userFactory.renewSession = function(username){
        return $http.get('/api/renewToken/' + username);
    }
    //Get user permission
    userFactory.getPermission = function(){
        return $http.get('/api/permission');
    }
    //Get user list
    userFactory.getUsers = function(){
        return $http.get('/api/management/');
    }
    //Delete a user
    userFactory.deleteUser = function(username){
        return $http.delete('/api/management/' + username);
    }
    return userFactory;
});
