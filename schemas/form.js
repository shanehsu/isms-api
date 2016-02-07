/*
 * Form 是表單
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Field = require('./field');

var formsSchema = new Schema({
    identifier: String,  // 內部編號，例如「ID-D-005」
    revision: Number,    // 表單格式版本
    signigtures: Number, // 簽核人數
    group: Number,       // 填表群組
    secret: Number,      // 機密等級
    template: String,
    fields: [Field]
});

module.exports = formsSchema;
