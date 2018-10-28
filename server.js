
var path = require('path');
var express = require('express');
var port = process.env.PORT || 8080;
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);

// middleware
app.use(morgan('dev'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
// give front end access to public
app.use(express.static(__dirname + '/public'));
// append /api/route for back-end routes
app.use('/api', appRoutes);

// connect to db filetrackdb
mongoose.connect("mongodb://localhost:27017/filetrackdb", { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to db');
});

// get index.html
app.get('*', function(req, res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// server port
app.listen(port, function(){
    console.log('running server port: ' + port);
});
