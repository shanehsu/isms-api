var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var news = require('./routes/news');
var token = require('./routes/token');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());

// Allow Origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes Here
app.use('/news', news);
app.use('/token', token);

// catch 404 and forward to error handler
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

/*
    Windows Server Credientials
    Administrator
    6c4tQRuBs

    Address: 192.168.1.21
*/

/*
    Account Details
    管理者：hsu.pengjun（Peng Jun Hsu）
    使用者：user（Peng Jun Hsu）
*/