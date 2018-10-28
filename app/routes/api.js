var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = "0d09f94093dab9f724538f9a849d6c43c85f6b9b";


module.exports = function(router) {
    //User registeration route
    //http://localhost:8080/api/users
    router.post('/users', function(req, res){
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        //validate and add user to db
        if(req.body.username == null || req.body.username == "" ||
            req.body.password == null || req.body.password == "" ||
            req.body.email == null || req.body.email == ""){
            res.json({
                success: false,
                message: 'Error: missing fields'
            });
        } else {
            user.save(function(err){
                if(err) {
                    if(err.errors!=null){
                        if(err.errors.email){
                            res.json({
                                success: false,
                                message: err.errors.email.message
                            });
                        } else if (err.errors.username) {
                            res.json({
                                success: false,
                                message: err.errors.username.message
                            });
                        } else if(err.errors.password) {
                            res.json({
                                success: false,
                                message: err.errors.password.message
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Error: Unable to register please recheck information entered'
                            });
                        }
                    } else {
                        res.json({
                            success: false,
                            message: 'Error: username or email already exists'
                        });
                    }
                } else {
                    res.json({
                        success: true,
                        message: 'User created successfully'
                    });
                }
            });
        }
    });

    // User Login Route
    //http://localhost:8080/api/authenticate
    router.post('/authenticate', function(req,res) {
        User.findOne({username: req.body.username}).select('email username password').exec(function(err, user) {
            if (err){ 
                throw err;
            }
            if (!user) {
                res.json({ success: false, message: 'Error: could not find user'});
            } else {
                if(req.body.password) {   
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'Error: invalid password' });
                    } else {
                        var token = jwt.sign({ 
                            username: user.username,
                            email: user.email
                        }, secret, { expiresIn: '1h' });
                        res.json({ success: true, message: 'Logged in', token: token });
                    }
                } else {
                    res.json({ success: false, message: 'Error: no password provided' });
                }
            }
        });
    });

    //middleware to decrypt auth token to identify logged in user
    router.use(function(req, res, next){
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if(token){
            //verify token
            jwt.verify(token, secret, function(err, decoded){
                if(err){
                    //Happens when token expires
                    res.json({success: false, message: 'Error: Invalid token'});
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({success: false, message: 'Error: no token provided'});
        }

    });

    //Route to current logged in user profile
    //http://localhost:8080/api/currentuser
    router.post('/currentuser', function(req, res){
        res.send(req.decoded);
    });

    //keep user logged in on renew token
    router.get('/renewToken/:username', function(req, res){
        User.findOne({username: req.params.username}).select().exec(function(err, user){
            if(err){
                throw err;
            }
            if(!user){
                res.json({success: false, message: 'Error: no user found'})
            } else {
                var newToken = jwt.sign({ 
                    username: user.username,
                    email: user.email
                }, secret, { expiresIn: '2h' });
                res.json({ success: true, message: 'Logged in', token: newToken });
            }
        });
    });

    //Get permission of user - used to check if user is admin or mod
    router.get('/permission', function(req, res){
        User.findOne({username: req.decoded.username}, function(err, user){
            if(err){
                throw err;
            }
            if(!user){
                res.json({success: false, message: 'Error: no user found'});
            } else {
                res.json({success: true, permission: user.permission});
            }
        });
    });

    //Return list of users in database
    router.get('/management', function(req, res){
        User.find({}, function(err, users){
            if(err){
                throw err;
            }
            // Makes sure current user is admin or mod
            User.findOne({username: req.decoded.username}, function(err, currentUser){
                if(err){
                    throw err;
                }
                if(!currentUser){
                    res.json({success: false, message: 'Error: no user found'});
                } else {
                    if(currentUser.permission === 'admin' || currentUser.permission === 'moderator'){
                        //User is admin/mod so get list
                        if(!users){
                            res.json({success: false, message: 'Error: user list not found'});
                        } else {
                            res.json({success: true, users: users, permission: currentUser.permission});
                        }
                    } else {
                        res.json({success: false, message: 'Error: insufficient permissions'});
                    }
                }
            });

        });
    });

    //Delete user - accessible to admin
    router.delete('/management/:username', function(req, res){
        var targetUser = req.params.username;
        //make sure current user has permission to delete target user
        User.findOne({username: req.decoded.username}, function(err, currentUser){
            if(err){
                throw err;
            }
            if(!currentUser){
                res.json({success: false, message: 'Error: no user found'});
            } else {
                if(currentUser.permission !== 'admin') {
                    res.json({success: false, message: 'Error: insufficient permissions'});
                } else {
                    User.findOneAndRemove({username: targetUser}, function(err, user){
                        if(err){
                            throw err;
                        }
                        res.json({success: true});
                    });
                }
            }
        });
    });

    return router;
}