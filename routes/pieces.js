// Prefix: /news

var express = require('express');
var Piece = require('../models/piece');

var router = express.Router();

// List all pieces
router.get('/', function(req, res, next) {
    res.redirect('./' + (new Date).toISOString())
});

router.get('/:fromDate', function(req, res, next) {
    var date = new Date(req.params.fromDate);
    Piece.find({
        date: {$lt: date}
    }).limit(10).exec().then(function(docs) {
        res.json(docs)
    }).catch(function(err) {
        next(err)
    })
});

router.post('/', function(req, res, next) {
    // if (validate_token(req.params.token)) {
    //     next(new Error('invalid token.'));
    // }
    Piece.create(req.body).then(function(doc) {
        res.json(doc)
    }).catch(function(err) {
        next(err)
    })
});

router.put('/:id', function(req, res, next) {
    // if (validate_token(req.params.token)) {
    //     next(new Error('invalid token.'));
    // }
    Piece.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        "new": true
    }).then(function(doc) {
        res.json(doc)
    }).catch(function(err) {
        next(err);
    })
})

router.delete('/:id', function(req, res, next) {
    // if (validate_token(req.params.token)) {
    //     next(new Error('invalid token.'));
    // }
    Piece.findByIdAndRemove(req.params.id).then(function(doc) {
        res.sendStatus(200)
    }).catch(function(err) {
        next(err)
    })
})

module.exports = router;
