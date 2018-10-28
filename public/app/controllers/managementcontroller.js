
angular.module('managementController', [])

.controller('managementcontroller', function(User){
    var self = this;
    var app = this;
    self.loading = true;
    self.accessDenied = true;
    self.errorMsg = false;
    self.editAccess = false;
    self.deleteAccess = false;
    self.limit = 5;

    var getUsers = function(){
        User.getUsers().then(function(data){
            if(data.data.success){
                if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                    self.users = data.data.users;
                    self.loading = false;
                    self.accessDenied = false;
                    if(data.data.permission === 'admin'){
                        self.editAccess = true;
                        self.deleteAccess = true;
                    } else if (data.data.permission === 'moderator'){
                        self.editAccess = true;
                    }
                } else {
                    self.errorMsg = 'Error: insufficient permissions';
                    self.loading = false;
                }
            } else {
                self.errorMsg = data.data.message;
                self.loading = false;
            }
        });
    }

    getUsers();

    self.showMore = function(number){
        self.errorMsg = false;
        if(number > 0){
            self.limit = number;

        } else {
            self.errorMsg = 'Error: invalid input. enter number more than 0';
        }
    }
    self.showAll = function(){
        self.limit = undefined;
        self.errorMsg = false;
    }
    self.deleteUser = function(username){
        User.deleteUser(username).then(function(data){
            if(data.data.success){
                getUsers();
            } else {
                self.errorMsg = data.data.message;
            }
        });
    }
})
