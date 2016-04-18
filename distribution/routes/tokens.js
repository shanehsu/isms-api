'use strict';
const express = require('express');
const auth = require('../util/auth');
var router = express.Router();
/**
 * GET /tokens
 *
 * 取得該使用者的所有登入代幣
 */
router.get('/', (req, res, next) => {
    const token = req.get('token');
    auth.return_user(token)
        .then(user => res.json(user.tokens))
        .catch(next);
});
/**
 * DEPRECATED
 *
 * POST /tokens/valid
 *
 * 回傳登入代幣是否有效。
 */
router.post('/valid', (req, res) => {
    const token = req.body.token;
    auth.validate_token(token)
        .then(() => res.json({ valid: true }))
        .catch(() => res.json({ valid: false }));
});
/**
 * GET /tokens/valid
 *
 * 回傳登入代幣是否有效。
 */
router.post('/valid', (req, res) => {
    const token = req.get('token');
    auth.validate_token(token)
        .then(() => res.json({ valid: true }))
        .catch(() => res.json({ valid: false }));
});
/**
 * DELETE /tokens/:id
 *
 * 刪除一個登入代幣。
 */
router.delete('/:id', function (req, res, next) {
    const token = req.get('token');
    const id = req.params.id;
    auth.return_user(token)
        .then(user => {
        user.tokens.filter(token => token['id'] != id);
        user.save((err) => {
            if (err) {
                next(err);
            }
            else {
                res.sendStatus(200);
            }
        });
    }).catch(next);
});
module.exports = router;
//# sourceMappingURL=tokens.js.map