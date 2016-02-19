'use strict';
var mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
exports.FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '欄位名稱',
        required: true
    },
    type: {
        type: String,
        default: 'shortText',
        required: true,
        validate: {
            validator: function (value) {
                return ['shortText', 'longText', 'date', 'options', 'table'].indexOf(value) >= 0;
            },
            message: '{VALUE} is not a valid field type.'
        }
    },
    hint: {
        type: String,
        required: false
    },
    // 這個裡面會是一個 JSON 字串
    metadata: {
        type: String,
        default: '{}',
        required: true,
        validate: {
            validator: function (value) {
                try {
                    JSON.parse(value);
                    return true;
                }
                catch (e) {
                    return false;
                }
            },
            message: '{VALUE} is not a valid JSON string.'
        },
        get: function (metadata) {
            return JSON.parse(metadata);
        },
        set: function (metadata) {
            return JSON.stringify(metadata);
        }
    }
});
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
 * 長文字：
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
//# sourceMappingURL=field.js.map