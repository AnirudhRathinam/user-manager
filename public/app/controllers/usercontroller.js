
angular.module('userControllers',['userServices'])

.controller('signupController', function($http, $location, User){
    var self = this;

    self.registerUser = function(data){
        self.loading = true;
        self.errorMsg = false;

        User.create(self.data).then(function(data){
            //console.log(data.data.success);
            //console.log(data.data.message);
            if(data.data.success){
                self.loading = false;
                //create success message and redirect to home
                self.successMsg = data.data.message;
                $location.path('/');
            } else {
                self.loading = false;
                //create error message 
                self.errorMsg = data.data.message;
            }
        });
    }
});
