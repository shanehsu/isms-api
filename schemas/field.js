/*
 * Field 是欄位。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: String,
    type: String,
    require: Boolean,
    metadata: String
});

module.exports = fieldSchema;

/*
 * name 是該欄位的名稱
 *
 * type 是欄位的種類
 * 分為 5 種：shortText, longText, date, options, table
 *
 * metadata 是欄位的定義
 *
 * 以下定義各種欄位種類的定義方式：
 * 
 * 短文字：
 * type: 'shortText',
 * metadata: {
 *   minLength: Number, (1) 
 *   maxLength: Number, (50)
 * }
 * 
 * 長文字：op
 * type: 'longText'
 * metadata: {
 *   minLength: Number, (1)
 *   maxLength: Number, (1000)
 * }
 * 
 * 日期：
 * type: 'date'
 * metadata: {
 *   minimumValue: String, (NOW)
 *   maximumValue: String  (2100-12-31)
 * }
 * 
 * (日期格式：YYYY-MM-DD 或是 NOW)
 * 
 * 選擇：
 * 
 * 單選
 * type: 'options'
 * metadata: {
 *   presentation: 'radio',
 *   options: [
 *     {
 *       name: String,
 *       value: String
 *       fields: [Field]
 *     }
 *   ] 
 * }
 * 
 * 多選 
 * metadata: {
 *   presentation: 'checkbox',
 *   options: [
 *     {
 *       name: String,
 *       value: String
 *     }
 *   ] 
 * }
 * 
 * 下拉式選單
 * metadata: {
 *   presentation: 'option',
 *   options: [
 *     {
 *       name: String,
 *       value: String
 *     }
 *   ] 
 * }
 * 
 */
