// Prefix: /users

var express = require('express');
var Users = require('../models/user');

var router = express.Router();
var authutils = require('../util/auth');

router.get('/', function(req, res, next) {
    authutils.validate_token(req.get('token')).then(function() {
        Users.find({}).then(function(users) {
            users.forEach(function(e) {
                e.tokens = undefined;
            });
            res.json(users);
        }).catch(next);
    }).catch(next);
});

router.post('/', function(req, res, next) {

});

router.put('/:id', function(req, res, next) {

});

router.delete('/:id', function(req, res, next) {

});

module.exports = router;
