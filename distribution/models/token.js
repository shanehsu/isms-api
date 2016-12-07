'use strict';
const mongoose = require('mongoose');
exports.TokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        requied: true
    },
    used: {
        type: Date,
        required: true
    }
});
//# sourceMappingURL=token.js.map