var thinky = require('../util/thinky.js');
var type = thinky.type;

var Group = thinky.createModel('Groups', {
    id: type.string(),
    name: type.string()
});

module.exports = Group;
