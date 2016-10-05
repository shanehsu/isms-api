'use strict';
const express = require("express");
const models_1 = require("./../libs/models");
const auth = require("../util/auth");
var router = express.Router();
/**
 * GET /users
 *
 * 取得所有使用者。
 */
router.get('/', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group).then(() => {
        models_1.User.find({}).exec().then(users => {
            users.forEach(user => user.tokens = undefined);
            res.json(users);
        }).catch(next);
    }).catch(next);
});
/**
 * POST /users
 *
 * 新增一個使用者。
 */
router.post('/', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group).then(function () {
        models_1.User.create({})
            .then(user => res.status(201).send(user.id))
            .catch(next);
    }).catch(next);
});
/**
 * GET /users/me
 *
 * 取得自己的資訊
 */
router.get('/me', (req, res, next) => {
    const token = req.get('token');
    auth.return_user(token).then(user => res.json(user)).catch(next);
});
/**
 * GET /users/:id
 *
 * 取得單一使用者的資訊
 */
router.get('/:id', (req, res, next) => {
    const token = req.get('token');
    const id = req.params.id;
    auth.return_user(token).then(user => {
        if (user.id == id) {
            res.json(user);
        }
        else {
            let group = 1;
            auth.ensure_group(token, group).then(() => {
                models_1.User.findById(id).exec().then(user => {
                    res.json(user);
                }).catch(next);
            }).catch(next);
        }
    }).catch(err => {
        console.error('可能要把我拿掉的一段 Code 加回來嗎？');
        next(err);
    });
    //  下面這一段看起來不需要 先移掉
    // .catch(function(err) {
    //   auth.ensure_group(req.get('token'), 1).then(function() {
    //     User.findById(req.params.id).then(function(user) {
    //       res.json(user);
    //     }).catch(next);
    //   }).catch(next);
    // });
});
/**
 * PUT /users/:id
 *
 * 更新使用者資訊。
 */
router.put('/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    // 刪除不該透過這個方法更新的資訊
    delete req.body.unit;
    delete req.body.tokens;
    auth.ensure_group(token, group).then(() => {
        models_1.User.findByIdAndUpdate(id, {
            $set: req.body
        }).exec().then(() => res.sendStatus(200)).catch(next);
    }).catch(next);
});
/**
 * DELETE /users/:id
 *
 * 刪除使用者。
 */
router.delete('/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    auth.ensure_group(token, group).then(() => {
        models_1.User.findById(id).exec().then(user => {
            if (user.unit) {
                next(new Error('使用者有單位隸屬，無法被刪除。'));
            }
            else {
                models_1.User.findByIdAndRemove(id).exec()
                    .then(() => res.sendStatus(200)).catch(next);
            }
        });
    }).catch(next);
});
module.exports = router;
//# sourceMappingURL=users.js.map