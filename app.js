var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('./util/mongoose');

var pieces = require('./routes/pieces');
var auth = require('./routes/auth');
var tokens = require('./routes/tokens');
var users = require('./routes/users')

var app = express();

// Disable Cacheing
app.use(logger('dev'));
app.use(bodyParser.json());

// Allow Origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "token, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

// Disable Cacheing
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// Routes Here
app.use('/pieces', pieces);
app.use('/auth', auth);
app.use('/tokens', tokens);
app.use('/users', users);

// catch 404 and forward to error handler
app.use("/", function(req, res) {
    res.send("Hello Express!");
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handlers
app.use(function(err, req, res, next) {
    console.log(err);
    console.log(err.message);
    res.sendStatus(err.status || 500);
});

module.exports = app;
