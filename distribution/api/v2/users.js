"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
exports.usersRouter = express.Router();
exports.usersRouter.use((req, res, next) => {
    if (req['group'] != 'admins') {
        res.status(401).send();
    }
    else {
        next();
    }
});
exports.usersRouter.get('/', (req, res, next) => {
    models_1.User.find({}, { password: 0, tokens: 0 }).then(res.json).catch(next);
});
exports.usersRouter.get('/:id', (req, res, next) => {
    models_1.User.findById(req.params.id, { password: 0, "tokens.token": 0 }).then(res.json).catch(next);
});
exports.usersRouter.post('/', (req, res, next) => {
    models_1.User.create({}).then(user => res.status(201).send(user.id)).catch(next);
});
exports.usersRouter.put('/:id', (req, res, next) => {
    delete req.body.tokens;
    delete req.body.password;
    models_1.User.findById(req.params.id).then(user => {
        let originalGroup = user.group;
        if (originalGroup == "vendors") {
            delete req.body.group;
        }
        else {
            if (req.body.group && req.body.group == "vendors") {
                next(new Error("不可以修改非廠商帳號的組別成為廠商。"));
                return;
            }
        }
        models_1.User.findByIdAndUpdate(req.params.id, { $set: req.body }).then(_ => res.status(204).send()).catch(next);
    }).catch(next);
});
exports.usersRouter.delete('/:id', (req, res, next) => {
    models_1.User.findById(req.params.id).then(user => {
        models_1.Unit.aggregate([
            {
                $project: {
                    _members: {
                        $concatArrays: ["$members.none", "$members.agents", ["$members.manager"], ["$members.docsControl"]]
                    },
                    members: 1,
                    name: 1,
                    identifier: 1
                }
            },
            {
                $match: {
                    _members: user.id
                }
            }
        ]).then(units => {
            if (units.length > 0) {
                next(new Error('使用者目前隸屬於某個單位'));
            }
            else {
                models_1.User.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next);
            }
        }).catch(next);
    });
});
/*
usersRouter.delete('/:id/tokens/:tokenID', (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, { $pull: { tokens: { _id: req.params.tokenID } } }).then(_ => res.status(204).send()).catch(next)
})
*/
//# sourceMappingURL=users.js.map