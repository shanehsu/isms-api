/*
 * Record 是紀錄
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    // 對應到表單格式
    formId: Schema.Types.ObjectId,
    formRevision: Number,

    // 對應到單位、人員
    owningUnit: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    signatures: [{
        personnel: Schema.Types.ObjectId,
        signed: Boolean
    }],
    serial: Number,

    // 實際資料
    data: {}
});

module.exports = recordSchema;
