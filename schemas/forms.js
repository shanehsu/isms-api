/*
 * Form 是表單
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var formsSchema = new Schema({
    identifier: String,
    revision: Number,
    fields: []
});

module.exports = formsSchema;
