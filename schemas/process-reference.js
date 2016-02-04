/*
 * ProcessReference 是程序書。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProcessReferenceSchema = new Schema({
    documentID: String, // 文件 ID, "IS-A-001"
    revision: Number,
    published: Date
});

module.exports = ProcessReferenceSchema;