// Prefix: /auth

var express = require('express');
var jwt     = require('jsonwebtoken');

var User    = require('../models/user');

var router = express.Router();

var auth    = require('../util/auth');

/* 認證方式：
 * /sso/login 將使用者導向至登入畫面
 * 該登入畫面在使用者輸入帳號、密碼後，將使用者瀏覽器導向至 /sso/result
 * 在 /sso/result 內，若確認使用者登入成功，則導至 /sso/success
 * 在 /sso/success 內，生成 Token，並回傳給使用者
 */

router.post('/', function(req, res) {
    var test_user = {
        email: 'user@test.com',
        name: 'User',
        title: 'User',
        group: [],
        unit: null,
        tokens: [
            {
                token: 'abcd',
                used: Date.parse('2015-12-26T19:06:33.625Z'),
                origin: '1.2.3.4',
                userAgent: 'some_browser'
            }
        ]
    }

    User.create(test_user).then(function(doc) {
        res.status(201)
        res.json(doc)
    }).catch(function(err) {
        next(err)
    })
});

router.get('/test', function(req, res) {
    var token = req.body.token;
    var User  = auth.return_user(token);

    console.dir(User);
    res.send(200);
});;

router.get('/sso/login', function(req, res, next) {

});

router.get('/sso/result', function(req, res, next) {

});

router.get('/sso/result', function(req, res, next) {

});

module.exports = router;

/* 使用 SSO 後的認證方式
 *
 * /sso/login   導向至 SSO 畫面
 * /sso/result  判定 SSO 認證結果
 * /sso/success 生成 Token 並回傳
 *
 */
