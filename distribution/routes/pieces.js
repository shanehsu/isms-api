'use strict';
const express = require("express");
const auth = require("../util/auth");
const models_1 = require("./../libs/models");
var router = express.Router();
/**
 * GET /pieces
 *
 * 回傳所有最新消息。
 */
router.get('/', (req, res, next) => {
    models_1.Piece.find({}).sort({ date: 'descending' }).exec()
        .then(docs => res.json(docs))
        .catch(next);
});
/**
 * GET /pieces/:id
 *
 * 回傳一筆最新消息。
 */
router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    models_1.Piece.findById(id).exec()
        .then(piece => res.json(piece))
        .catch(next);
});
/**
 * POST /pieces
 *
 * 新增一個空的最新消息。
 * 回傳一個 ID 指向該資源。
 */
router.post('/', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Piece.create({})
            .then(doc => res.status(201).send(doc.id))
            .catch(next);
    })
        .catch(next);
});
/**
 * PUT /pieces/:id
 *
 * 更新一個最新消息的資訊。
 */
router.put('/:id', (req, res, next) => {
    const token = req.get('token');
    const id = req.params.id;
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Piece.findByIdAndUpdate(id, { $set: req.body }).exec()
            .then(() => res.sendStatus(204))
            .catch(next);
    })
        .catch(next);
});
/**
 * DELETE /pieces/:id
 *
 * 刪除一個最新消息。
 */
router.delete('/:id', (req, res, next) => {
    const token = req.get('token');
    const id = req.params.id;
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Piece.findByIdAndRemove(id).exec()
            .then(() => res.sendStatus(200))
            .catch(next);
    })
        .catch(next);
});
module.exports = router;
//# sourceMappingURL=pieces.js.map