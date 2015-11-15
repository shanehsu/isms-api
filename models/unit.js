var thinky = require('../util/thinky.js');
var type = thinky.type;

var Unit = thinky.createModel('Units', {
    id: type.string(),
    name: type.string(),
    unitID: type.string()
});

var User = require('user');

Unit.belongsTo(Unit, 'parentUnit', 'parentID', 'id');
Unit.hasOne(User, 'manager', 'managerID', 'id');
Unit.hasOne(User, 'docsControl', 'docsControlID', 'id');
module.exports = Unit;
