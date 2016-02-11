'use strict';
var mongoose = require('mongoose');
var FormRevision = require('./form-revision');
exports.FormSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: false
    },
    // 各個版本
    revesions: {
        type: [FormRevision.FormRevisionSchema],
        required: false
    }
});
exports.Form = mongoose.model('Form', exports.FormSchema);
//# sourceMappingURL=form.js.map