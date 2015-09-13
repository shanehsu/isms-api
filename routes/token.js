// Prefix: /token

var express = require('express');
var rethink = require('rethinkdb');
var jwt     = require('jsonwebtoken');

// Active Directory
var ActiveDirectory = require('activedirectory');
var config = { 
               url: 'ldap://192.168.1.21',
               baseDN: 'ou=ISMS,dc=shanehsu,dc=idv,dc=tw',
               username: 'Administrator@shanehsu.idv.tw',
               password: '6c4tQRuBs'
            };
var ad = new ActiveDirectory(config);

var router = express.Router();

// List all pieces
router.post('/', function(req, res, next) {
    ad.authenticate(req.body.email, req.body.password, function(err, auth) {
        if (err) {
            return next(new Error(err.description));
        }
        if (auth) {
            rethink.connect({
                host: '192.168.99.100',
                port: 32769,
                db: 'ISMS'
                // use authentication key in production
            }).then(function(connection) {
                rethink.table('users').filter({email: req.body.email}).run(connection).then(function(selection) {
                    selection.toArray().then(function(array) {
                        if (array.length == 0) {
                            return next(new Error('user has no role'));
                        } else if (array.length == 1) {
                            // Success Here!
                            var user_identity = array[0]
                            delete user_identity.tokens
                            var token = jwt.sign(user_identity, 's0mesecr3t');

                            rethink.table('users').getAll(req.body.email, {index: 'email'}).update({
                                'tokens': rethink.row('tokens').append(token)
                            }).run(connection).then(function() {
                                res.send(token);
                            }).error(function(err) {
                                return next(new Error('cannot write token back to database'));
                            });

                        } else {
                            return next(new Error('user has multiple records linked to the same email'));
                        }
                    }).error(function(err) {
                        console.log('cannot convert user selection to array');
                    });
                }).error(function(err) {
                    return next(new Error('cannot operate on table \'users\''));
                });
            }).error(function(error) {
                return next(new Error('cannot connect to database'));
            });
        }
        else {
            return next(new Error('credentials is not valid'));
        }
    });
});

router.post('/valid', function(req, res, next) {
    rethink.connect({
        host: '192.168.99.100',
        port: 32769,
        db: 'ISMS'
        // use authentication key in production
    }).then(function(connection) {
        rethink.table('users').filter(
            rethink.row('tokens').contains(req.body.token)
        ).run(connection).then(function(selection) {
            selection.toArray().then(function(array) {
                if (array.length == 0) {
                    res.json({
                        valid: false
                    });
                } else if (array.length == 1) {
                    res.json({
                        valid: true
                    });
                } else {
                    return next(new Error('token maps to multiple user'));
                }
            }).error(function(err) {
                console.log('cannot convert user selection to array');
            });
        }).error(function(err) {
            return next(new Error('cannot operate on table \'users\''));
        });
    }).error(function(error) {
        return next(new Error('cannot connect to database'));
    });
});

module.exports = router;
