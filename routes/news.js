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

router.post('/', function(req, res, next) {
    // TODO: Access Control!
    var body = req.body;
    var news = new News({
        title: body.title,
        summary: body.summary,
        link: body.link,
        date: Date(body.date)
    });

    news.save().then(function(doc) {
        res.json(doc);
    }).catch(function(err) {
        next(err);
    });
});

module.exports = router;
