'use strict';
const mongoose = require('mongoose');
const FormRevision = require('./form-revision');
exports.FormSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        default: 'ISMS-NEW'
    },
    name: {
        type: String,
        required: true,
        default: '新表單'
    },
    // 各個版本
    revisions: {
        type: [FormRevision.FormRevisionSchema],
        required: false,
        default: []
    }
});
exports.Form = mongoose.model('Form', exports.FormSchema);
//# sourceMappingURL=form.js.map