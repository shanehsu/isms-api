'use strict';
var mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
exports.RecordSchema = new mongoose.Schema({
    // 對應到表單的格式
    formID: {
        type: ObjectId,
        required: false
    },
    formRevision: {
        type: Number,
        required: false
    },
    // 對應到一個單位
    owningUnit: {
        type: ObjectId,
        required: false
    },
    // 對應到填寫日
    created: {
        type: Date,
        required: true,
        default: new Date()
    },
    // 對應到流水號
    serial: {
        type: Number,
        required: false
    },
    // 對應到填寫者
    owner: {
        type: ObjectId,
        required: false
    },
    // 需要簽核的話，對應到簽核者
    signatures: {
        type: [
            {
                personnel: ObjectId,
                signed: Boolean
            }
        ],
        required: false
    },
    // 表單資料
    data: {
        type: String,
        required: false,
        get: function (metadata) {
            return JSON.parse(metadata);
        },
        set: function (metadata) {
            return JSON.stringify(metadata);
        }
    }
});
exports.Record = mongoose.model('Record', exports.RecordSchema);
//# sourceMappingURL=record.js.map