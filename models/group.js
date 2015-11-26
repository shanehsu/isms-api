var mongoose = require('mongoose');
var groupSchema = require('./../schemas/group');

module.exports = mongoose.model('Group', groupSchema);
