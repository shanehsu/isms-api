// file: util/thinky.js
var thinky = require('thinky')({
    host: '192.168.99.100',
    port: 32769,
    db: 'ISMS'
});

module.exports = thinky;
