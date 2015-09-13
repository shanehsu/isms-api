// Prefix: /news

var express = require('express');
var News = require('../models/news.js');

var router = express.Router();

// List all pieces
router.get('/', function(req, res, next) {
    News.run().then(function(news) {
        res.json(news);
    }).catch(function(err) {
        next(err);
    });
});

module.exports = router;
