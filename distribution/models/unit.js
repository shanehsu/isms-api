'use strict';
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
exports.UnitSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '單位名稱',
        required: true
    },
    identifier: {
        type: Number,
        default: 0,
        required: true
    },
    parentUnit: {
        type: ObjectId,
        required: false
    },
    members: {
        none: {
            type: [ObjectId],
            require: true,
            default: []
        },
        manager: {
            type: ObjectId,
            required: false
        },
        docsControl: {
            type: ObjectId,
            required: false
        },
        agents: {
            type: [ObjectId],
            required: true,
            default: []
        }
    }
});
exports.Unit = mongoose.model('Unit', exports.UnitSchema);
//# sourceMappingURL=unit.js.map