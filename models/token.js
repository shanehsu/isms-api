var thinky = require('../util/thinky.js');
var type = thinky.type;

var Token = thinky.createModel('Tokens', {
    id: type.string(),
    token: type.string(),
    used: type.date(),
    origin: type.string(),
    UA: type.string()
});

var User = require('user');

Token.belongsTo(User, 'user', 'userID', 'id');

module.exports = Unit;
