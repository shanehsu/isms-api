/*
 * Piece 是新聞。
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pieceSchema = new Schema({
    date: Date,
    summary: String,
    source: String,
    link: String
});

module.exports = pieceSchema;
