// Prefix: /users

var express = require('express');
var Users = require('../models/user');

var router = express.Router();
var authutils = require('../util/auth');

router.get('/', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        Users.find({}).then(function(users) {
            users.forEach(function(e) {
                e.tokens = undefined;
            });
            res.json(users);
        }).catch(next);
    }).catch(next);
});

router.post('/', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        var new_user = new Users(req.body);
        new_user.save().then(function(user) {
            res.send(user.id);
        }).catch(next);
    }).catch(next);
});

router.get('/me', function(req, res, next) {
  authutils.return_user(req.get('token')).then(function(user) {
    res.json(user);
  }).catch(next);
});

router.get('/:id', function(req, res, next) {
    authutils.return_user(req.get('token')).then(function(user) {
        if (user.id == req.params.id) {
            res.json(user);
        } else {
            authutils.ensure_group(req.get('token'), 1).then(function() {
                Users.findById(req.params.id).then(function(user) {
                    res.json(user);
                }).catch(next);
            }).catch(next);
        }
    }).catch(function(err) {
        authutils.ensure_group(req.get('token'), 1).then(function() {
            Users.findById(req.params.id).then(function(user) {
                res.json(user);
            }).catch(next);
        }).catch(next);
    });
});

router.put('/:id', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        Users.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {
            "new": true
        }).then(function(doc) {
            res.json(doc)
        }).catch(next);
    }).catch(next);
});

router.delete('/:id', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        Users.findByIdAndRemove(req.params.id, {
            $set: req.body
        }).then(function(doc) {
            res.sendStatus(200);
        }).catch(next);
    }).catch(next);
});

module.exports = router;
