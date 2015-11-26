/*
 * Unit 是行政單位。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var unitSchema = new Schema({
    name: String,
    identifier: Number, // 學校的行政單位編號
    parentUnit: Schema.Types.ObjectId,   // 兩者的關係必須自己維護
    childUnits: [Schema.Types.ObjectId], // 兩者的關係必須自己維護
    manager: Schema.Types.ObjectId,      // 主管
    docsControl: Schema.Types.ObjectId,  // 文管
    agents: [Schema.Types.ObjectId]      // 承辦人
});

module.exports = unitSchema;
