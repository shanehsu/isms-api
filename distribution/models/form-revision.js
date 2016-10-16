'use strict';
const mongoose = require('mongoose');
const Field = require('./field');
exports.FormRevisionSchema = new mongoose.Schema({
    // 版本編號
    revision: {
        type: Number,
        required: true
    },
    // 簽核
    signatures: {
        type: Boolean,
        required: true,
        default: false
    },
    officerSignature: {
        type: Boolean,
        required: true,
        default: false
    },
    published: {
        type: Boolean,
        required: true,
        default: false
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
        default: 4
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