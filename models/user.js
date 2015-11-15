var thinky = require('../util/thinky.js');
var type = thinky.type;

var User = thinky.createModel('Users', {
    id: type.string(),
    email: type.string(),
    name: type.string(),
    title: type.string()
});

var Group = require('group');
var Unit = require('unit');

User.hasAndBelongsToMany(Group, 'groups', 'id', 'id');
User.belongsTo(Unit, 'unit', 'unitID', 'id');

module.exports = Unit;
