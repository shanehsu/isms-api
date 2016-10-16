'use strict';
const mongoose = require('mongoose');
const Token = require('./token');
exports.UserSchema = new mongoose.Schema({
    email: {
        type: String,
        default: 'user@cc.ncue.edu.tw',
        required: true
    },
    name: {
        type: String,
        default: '王大明',
        required: true
    },
    group: {
        type: Number,
        default: 2,
        required: true
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    tokens: {
        type: [Token.TokenSchema],
        default: [],
        required: false
    }
});
exports.User = mongoose.model('User', exports.UserSchema);
//# sourceMappingURL=user.js.map