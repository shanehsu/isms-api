// Prefix: /auth

var express = require('express');
var jwt     = require('jsonwebtoken');

var User    = require('../models/user');

var router = express.Router();

var jwt_private_key = 'some_very_secret_key';

router.post('/login', function(req, res, next) {
    User.find({email: req.body.email}).then(function(users) {
        if (users.length != 1) {
            next(new Error('Email address correspond to zero/multiple user.'));
        } else {
            console.log('No password is required. Generating a token immediately.');
            var payload = users[0];
            payload.group = undefined;
            payload.unit = undefined;
            payload.tokens = undefined;
            var token = {
                token: jwt.sign(payload, jwt_private_key),
                used: new Date(),
                origin: req.ip,
                userAgent: req.headers['user-agent']
            };

            User.findByIdAndUpdate(users[0]._id, {
                $push: {
                    tokens: token
                }
            }, {
                "new": true
            }).then(function(doc) {
                res.send(token.token);
            }).catch(next);
        }
    }).catch(next);
});

module.exports = router;
