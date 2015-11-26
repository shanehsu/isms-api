// Prefix: /news

var express = require('express');
var Piece = require('../models/piece');

var router = express.Router();

// List all pieces
router.get('/', function(req, res, next) {
    res.redirect('./' + (new Date).toISOString());
});

router.get('/:fromDate', function(req, res, next) {
    var date = new Date(req.params.fromDate);
    Piece.find({
        date: {$lt: date}
    }).limit(10).exec().then(function(docs) {
        res.json(docs);
    }).catch(function(err) {
        next(err);
    })
});

// router.post('/', function(req, res, next) {
//     // TODO: Access Control!
//     var body = req.body;
//     var news = new News({
//         summary: body.summary,
//         link: body.link,
//         date: Date(body.date),
//         source: body.source
//     });
//
//     news.save().then(function(news) {
//         res.json(news);
//     }).catch(function(err) {
//         next(err);
//     });
// });
//
// router.get('/:id', function(req, res, next) {
//     News.get(id).then(function(news) {
//         res.json(news);
//     }).catch(function(err) {
//         next(err);
//     });
// });
//
// router.put('/:id', function(req, res, next) {
//     News.get(id).then(function(news) {
//         news.merge(req.body).save(function(news) {
//             res.json(news);
//         }).catch(function(err) {
//             next(err);
//         });
//     }).catch(function(err) {
//         next(err);
//     });
// });
//
// router.delete('/:id', function(req, res, next) {
//     News.get(id).then(function(news) {
//         news.delete().then(function(result) {
//             res.json({
//                 success: true
//             })
//         }).catch(function(err) {
//             next(err);
//         });
//     }).catch(function(err) {
//         next(err);
//     });
// });

module.exports = router;
