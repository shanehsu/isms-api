// Prefix: /news

var express = require('express');
var rethink = require('rethinkdb');

var router = express.Router();

// List all pieces
router.get('/', function(req, res, next) {
    rethink.connect({
        host: '192.168.99.100',
        port: 32769,
        db: 'ISMS'
        // use authentication key in production
    }).then(function(connection) {
        rethink.table('news').orderBy('date').limit(10).run(connection).then(function(cursor) {
            cursor.toArray().then(function(result) {
                res.json(result);
            }).error(function(error) {
                return next(new Error('cannot convert news result to array'));
            });
        }).error(function(error) {
            return next(new Error('cannot fetch news'));
        })
    }).error(function(error) {
        return next(new Error('cannot connect to database'));
    })
});

module.exports = router;
