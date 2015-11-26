/*
 * User 是使用者。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TokenSchema = require('./token');

var userSchema = new Schema({
    email: String,
    name: String,
    title: String,
    group: [Schema.Types.ObjectId],
    unit: Schema.Types.ObjectId,
    tokens: [TokenSchema]
});

module.exports = userSchema;
