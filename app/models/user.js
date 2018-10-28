var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var validate = require('mongoose-validator');

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Error: Not a valid e-mail'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'Error: Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'Error: Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Error: Username must only contain numbers or characters'
    }),
];

/*
Regex: ^(?!.* )(?=.*\d)(?=.*[A-Z]).{5,15}$
.{5,15}: 5 to 15 characters long
(?!.* ): No whitespaces allowed
(?=.*\d) means: Must hava at least 1 digit.
(?=.*[A-Z]) means: Must have at least 1 capital letter
*/
var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?!.* )(?=.*\d)(?=.*[A-Z]).{5,15}$/,
        message: 'Error: Invalid password. Password must have 5-15 characters, should not contain spaces, should have at least 1 digit and 1 capital character'
    })
];

var UserSchema = new Schema({
    username: {
        type: String, 
        lowercase: true, 
        required: true,
        unique: true,
        validate: usernameValidator
    },
    password: {
        type: String,
        required: true,
        validate: passwordValidator
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: emailValidator
    },
    //permission types: admin, moderator, user
    permission: {
        type: String,
        required: true,
        default: 'user'
    }
});

//Encrypt password
UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err) return next(err);
        user.password = hash;
        next();
    });
});

//Verify password in login
UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}



module.exports = mongoose.model('User', UserSchema);