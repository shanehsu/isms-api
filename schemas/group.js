/*
 * Group 是群組，應該會分為 3 個群組，管理者、安全人員、使用者
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
    type: Number
});

module.exports = groupSchema;
