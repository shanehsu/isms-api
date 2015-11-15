// Prefix: /token

var express = require('express');
var jwt     = require('jsonwebtoken');
var User    = require('../models/user');
var Token   = requires('../models/token')
var router = express.Router();

/* 認證方式：
 * /sso/login 將使用者導向至登入畫面
 * 該登入畫面在使用者輸入帳號、密碼後，將使用者瀏覽器導向至 /sso/result
 * 在 /sso/result 內，若確認使用者登入成功，則導至 /sso/success
 * 在 /sso/success 內，生成 Token，並回傳給使用者
 */

router.get('/sso/login', function(req, res, next) {
    // 因為目前未整合 SSO，直接導向回 /sso/result
    res.redirect(302, '/sso/result');
});

router.get('/sso/result', function(req, res, next) {
    // 理論上，這裡會從伺服器端取得一個證明，
    // 驗證該證明，並導回 /sso/success
    res.redirect(302, '/sso/success');
});

router.get('/sso/result', function(req, res, next) {
    // 若使用者從 SSO 登入，但不在資料庫中，必須自動建立資料。

    var key = 't678m087ygbnm';
    var _email = 'hsu.pengjun@cc.ncue.edu.tw'
    User.filter({email: _email}).run().then(function(user) {
        var _token = jwt.sign(user, key);
        var token_record = new Token({
            token: _token,
            used: Date.now(),
            origin: req.ip,
            UA: req.get('user-agent')
        });
        token_record.belongsTo(user);
        token_record.saveAll().then(function(token) {
            res.redirect('http://127.0.0.1/#/token/' + token);
        }).catch(function(err) {
            next(err);
        });
    }).catch(function(err) {
        next(err);
    });
});

module.exports = router;

/* 使用 SSO 後的認證方式
 *
 * /sso/login   導向至 SSO 畫面
 * /sso/result  判定 SSO 認證結果
 * /sso/success 生成 Token 並回傳
 */
