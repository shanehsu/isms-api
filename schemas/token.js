/*
 * Token 是登入代幣。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    token: String,
    used: Date,
    origin: String,
    UA: String
});

module.exports = tokenSchema;
