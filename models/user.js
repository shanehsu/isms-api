var mongoose = require('mongoose');

module.exports = mongoose.model('User', require('./../schemas/user'));
