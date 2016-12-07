'use strict';
const mongoose = require('mongoose');
const Token = require('./token');
const password_1 = require('./password');
exports.UserSchema = new mongoose.Schema({
    email: {
        type: String,
        default: 'user@cc.ncue.edu.tw',
        required: true,
        unique: true
    },
    password: {
        type: password_1.PasswordSchema,
        required: false
    },
    name: {
        type: String,
        default: '王大明',
        required: true
    },
    group: {
        type: String,
        default: 'users',
        required: true
    },
    tokens: {
        type: [Token.TokenSchema],
        default: [],
        required: false
    },
    confirmed: {
        type: Boolean,
        default: true,
        required: true
    }
});
exports.User = mongoose.model('User', exports.UserSchema);
//# sourceMappingURL=user.js.map