'use strict';
const mongoose = require("mongoose");
exports.PieceSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date(),
        required: true
    },
    summary: {
        type: String,
        default: '簡短標題',
        required: true
    },
    source: {
        type: String,
        default: '來源',
        required: true
    },
    link: {
        type: String,
        default: '#',
        required: true
    }
});
exports.Piece = mongoose.model('Piece', exports.PieceSchema);
//# sourceMappingURL=piece.js.map