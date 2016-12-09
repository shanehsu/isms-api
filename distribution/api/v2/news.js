"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
exports.newsRouter = express.Router();
exports.newsRouter.get('/', (req, res, next) => {
    if (req.query && req.query.page) {
        let page = +req.query.page - 1;
        models_1.Piece.find().sort({ date: 'descending' }).skip(page * 10).limit(10).then(data => res.json(data)).catch(next);
    }
    else {
        models_1.Piece.find().sort({ date: 'descending' }).then(data => res.json(data)).catch(next);
    }
});
exports.newsRouter.get('/:id', (req, res, next) => {
    const id = req.params.id;
    models_1.Piece.findById(id).then(p => res.json(p)).catch(next);
});
exports.newsRouter.post('/', (req, res, next) => {
    let group = req['group'];
    if (group == "admins") {
        models_1.Piece.create({}).then(piece => res.status(201).send(piece.id)).catch(next);
    }
    else {
        res.status(401).send();
    }
});
exports.newsRouter.put('/:id', (req, res, next) => {
    let group = req['group'];
    if (group == "admins") {
        const id = req.params.id;
        models_1.Piece.findByIdAndUpdate(id, { $set: req.body }).then(_ => res.status(204).send()).catch(next);
    }
    else {
        res.status(401).send();
    }
});
exports.newsRouter.delete('/:id', (req, res, next) => {
    let group = req['group'];
    if (group == 'admins') {
        models_1.Piece.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next);
    }
    else {
        res.status(401).send();
    }
});
//# sourceMappingURL=news.js.map