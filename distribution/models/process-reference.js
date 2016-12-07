'use strict';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
exports.ProcessReferenceSchema = new mongoose.Schema({
    // 文件名稱
    // 範例：文件管理程序書
    name: {
        type: String,
        required: false
    },
    // 文件 ID
    // 範例：IS-B-001
    documentID: {
        type: String,
        required: false
    },
    // 文件版本
    // 範例：1.3
    revision: {
        type: Number,
        required: false
    },
    // 文件發表日期
    published: {
        type: Date,
        required: false
    },
    // 文件 Base 64 檔案
    blob: {
        type: String,
        required: false
    },
    // 文件機密等級
    // 2（1 機密／2 限閱／3 一般）
    secrecyLevel: {
        type: Number,
        required: false
    },
    // 文件管理人
    managementPersonnel: {
        type: ObjectId,
        required: false
    },
    // 相關表單
    forms: {
        type: [ObjectId],
        required: false
    }
});
exports.ProcessReference = mongoose.model('ProcessReference', exports.ProcessReferenceSchema);
//# sourceMappingURL=process-reference.js.map