'use strict';
var mongoose = require('mongoose');
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
    childUnits: {
        type: [ObjectId],
        required: false
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
        required: false
    }
});
exports.Unit = mongoose.model('Unit', exports.UnitSchema);
//# sourceMappingURL=unit.js.map