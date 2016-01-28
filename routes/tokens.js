// Prefix: /tokens

var express = require('express');
var Users = require('../models/user');

var router = express.Router();
var authutils = require('../util/auth');

router.get('/', function(req, res, next) {
    authutils.return_user(req.get('token')).then(function(user) {
        res.json(user.tokens);
    }).catch(next);
});

router.post('/valid', function(req, res) {
  authutils.validate_token(req.body.token).then(function() {
    res.json({
      valid: true
    });
  }).catch(function() {
    res.json({
      valid: false
    });
  });
});

router.delete('/:token_id', function(req, res, next) {
    authutils.return_user(req.get('token')).then(function(user) {
        user.update({
            $pull: {
                tokens: {
                    _id: req.params.token_id
                }
            }
        }, {
            "new": true
        }).then(function(doc) {
            res.sendStatus(200);
        }).catch(next);
    }).catch(next);
});

module.exports = router;