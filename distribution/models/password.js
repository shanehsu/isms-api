"use strict";
const mongoose = require('mongoose');
exports.PasswordSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    iteration: {
        type: Number,
        requied: true
    }
});
//# sourceMappingURL=password.js.map