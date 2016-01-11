// Prefix: /news

var express = require('express');
var Piece = require('../models/piece');

var router = express.Router();

// List all pieces
router.get('/', function(req, res, next) {
    var date = new Date();
    if (req.query.fromDate) {
        date = new Date(req.query.fromDate);
    }
    Piece.find({
        date: {$lt: date}
    }).limit(10).exec().then(function(docs) {
        res.json(docs)
    }).catch(next);
});

router.post('/', function(req, res, next) {
    // if (validate_token(req.body.token)) {
    //     next(new Error('invalid token.'));
    // } else {
    //     req.body.token = undefined
    // }
    Piece.create(req.body).then(function(doc) {
        res.status(201)
        res.json(doc)
    }).catch(next);
});

router.put('/:id', function(req, res, next) {
    // if (validate_token(req.body.token)) {
    //     next(new Error('invalid token.'));
    // } else {
    //     req.body.token = undefined
    // }
    Piece.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, {
        "new": true
    }).then(function(doc) {
        res.json(doc)
    }).catch(next);
})

router.delete('/:id', function(req, res, next) {
    // if (validate_token(req.body.token)) {
    //     next(new Error('invalid token.'));
    // } else {
    //     req.body.token = undefined
    // }
    Piece.findByIdAndRemove(req.params.id).then(function(doc) {
        res.sendStatus(200)
    }).catch(next);
})

module.exports = router;
