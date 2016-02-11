'use strict';
var express = require('express');
var crypto = require('crypto');
var models_1 = require('./../libs/models');
var router = express.Router();
/**
 * POST /login
 *
 * 登入處理常式，指定使用者電子郵件
 * 為使用者產生登入代幣
 */
router.post('/login', (req, res, next) => {
    models_1.User.find({ email: req.body.email }).exec()
        .then(users => {
        if (users.length == 0) {
            next(new Error('傳入的電子郵件 "' + req.body.email + '" 不屬於任何一名使用者。'));
        }
        else if (users.length > 1) {
            next(new Error('傳入的電子郵件 "' + req.body.email + '" 屬於任何多名使用者。'));
        }
        else {
            console.log('測試階段尚未實作單一簽入，不需要密碼驗證。直接產生登入代幣。');
            let token = {
                token: crypto.randomBytes(16).toString('hex'),
                used: new Date(),
                origin: req.ip,
                userAgent: req.headers['user-agent']
            };
            models_1.User.findByIdAndUpdate(users[0].id, {
                $push: {
                    tokens: token
                }
            }).exec().then(doc => res.send(token.token)).catch(next);
        }
    })
        .catch(next);
});
module.exports = router;
//# sourceMappingURL=auth.js.map