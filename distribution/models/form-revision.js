'use strict';
var mongoose = require('mongoose');
var Field = require('./field');
exports.FormRevisionSchema = new mongoose.Schema({
    // 版本編號
    revision: {
        type: Number,
        required: true
    },
    // 簽核人數
    signatures: {
        type: Number,
        required: true,
        default: 1
    },
    // 填表群組
    group: {
        type: Number,
        required: true,
        default: 3
    },
    // 機密等級
    secrecyLevel: {
        type: Number,
        required: true,
        default: 3
    },
    // 樣板
    template: {
        type: String,
        required: false
    },
    // 表單格式
    fields: {
        type: [Field.FieldSchema],
        requied: false
    }
});
//# sourceMappingURL=form-revision.js.map