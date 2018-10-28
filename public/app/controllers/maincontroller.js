

angular.module('mainController', ['authservice', 'userServices'])

.controller('mainControl', function(Auth, AuthToken, User, $location, $timeout, $rootScope, $window, $interval, $route){
    var self = this;
    self.isLoading = false;
    self.checkSession = function(){
        if(Auth.isLoggedIn()){
            self.checkingSession = true;
            var interval = $interval(function(){
                var token = $window.localStorage.getItem('token');
                if(token == null){
                    $interval.cancel(interval);
                } else {
                    self.parseJwt = function(token) {
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        return JSON.parse($window.atob(base64));
                    }
                    var expireTime = self.parseJwt(token);
                    var timestamp = Math.floor(Date.now()/1000);
                    //console.log(expireTime.exp);
                    //console.log(timestamp);
                    var expiryCheck = expireTime.exp - timestamp;
                    //console.log(expiryCheck);
                    if(expiryCheck <= 5 && expiryCheck >= 0){
                        showExpireWarningPopup(1);
                        $interval.cancel(interval);
                    }
                }
            }, 1000);
        }
    }
    self.checkSession();

    //For showing expire warning and logout popup
    var showExpireWarningPopup = function(option){
        self.sessionChoice = false;
        self.modalHeader = '';
        self.modalBody = '';
        self.hideButtons = false;
        if(option === 1){
            //Show warning
            self.modalHeader = "Warning";
            self.modalBody = "Your session is about to expire. Would you like to renew your session";
            $("#myModal").modal({backdrop: "static"});
        } else if(option === 2){
            self.hideButtons = true;
            //Logout
            self.modalHeader = "Logging out"
            $("#myModal").modal({backdrop: "static"});
            $timeout(function(){
                Auth.logout();
                hideExpireWarningPopup();
                $location.path('/');
                $route.reload();
            }, 1000);
        }
        $timeout(function(){
            if(!self.sessionChoice){
                hideExpireWarningPopup();
            }
        }, 5000);
    }

    var hideExpireWarningPopup = function(){
        $("#myModal").modal('hide');
    }

    self.renewSession = function(){
        self.sessionChoice = true;
        User.renewSession(self.username).then(function(userdata){
            if(userdata.data.success){
                AuthToken.toggleToken(userdata.data.token);
                self.checkSession();
            } else {
                self.modalBody = userdata.data.message;
            }
        });
        hideExpireWarningPopup();
    };

    self.endSession = function(){
        self.sessionChoice = true;
        hideExpireWarningPopup();
        $timeout(function(){
            showExpireWarningPopup(2);
        },1000);
    };


    $rootScope.$on('$routeChangeStart', function(){

        if(!self.checkSession){
            self.checkSession();
        }

        if(Auth.isLoggedIn()){
            //console.log('Success: User logged in');
            self.isLoggedIn = true;
            Auth.getUser().then(function(userdata){
                //console.log(userdata.data.username);
                self.username = userdata.data.username;
                self.email = userdata.data.email;

                User.getPermission().then(function(data){
                    if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                        self.authorized = true;
                        self.isLoading = true;
                    } else {
                        self.isLoading = true;
                    }
                });
            });
        } else {
            self.isLoggedIn = false;
            //console.log('Failure: User not logged in');
            self.username = '';
            self.isLoading = true;
        }
    });

    self.doLogin = function(data){
        self.loading = true;
        self.errorMsg = false;
        self.successMsg = 'Redirecting';

        Auth.login(self.data).then(function(data){
            //console.log(data.data.success);
            //console.log(data.data.message);
            if(data.data.success){
                self.loading = false;
                //create success message and redirect to home
                self.successMsg = data.data.message;
                $location.path('/');
                self.data = '';
                self.successMsg = false;
                self.checkSession();
            } else {
                self.loading = false;
                //create error message 
                self.errorMsg = data.data.message;
            }
        });
    };

    self.doLogout = function(){
       showExpireWarningPopup(2);

    };
});
    