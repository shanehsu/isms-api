// file: util/thinky.js
var thinky = require('thinky')({
    host: 'rethinkdb',
    port: 28015,
    db: 'ISMS'
});

module.exports = thinky;
