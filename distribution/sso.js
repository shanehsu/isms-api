"use strict";
const express = require('express');
const crypto = require('crypto');
exports.ssoRouter = express.Router();
var inMemoryDatabase = [];
/*
 GET /
 回傳登入畫面
 */
exports.ssoRouter.get('', (req, res, next) => {
    let redirectUrl = req.query.redirectUrl;
    let encodedRedirectUrl = encodeURIComponent(redirectUrl);
    if (!redirectUrl) {
        res.contentType('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SSO 登入</title>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.4/semantic.min.css">
      <script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
      <script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.4/semantic.min.js"></script>
    </head>
    <body>
      <div class="ui container">
        <div class="ui one item menu" style="margin-top: 0.5em;">
          <a class="item">SSO</a>
        </div>
        <div class="ui negative message">
          <div class="header">
            SSO 錯誤
          </div>
          <p>您所用的網址必須使用 redirectUrl 搜尋字串。</p>
        </div>
      </div>
    </body>
    </html>
    `);
    }
    else {
        res.contentType('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SSO 登入</title>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.4/semantic.min.css">
      <script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
      <script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.4/semantic.min.js"></script>
    </head>
    <body>
      <div class="ui container">
        <div class="ui one item menu" style="margin-top: 0.5em;">
          <a class="item">SSO</a>
        </div>
        <form class="ui form" method="POST" action="/sso/login?redirectUrl=${encodedRedirectUrl}">
          <div class="field">
            <label>電子郵件位址</label>
            <input type="email" name="email" placeholder="電子郵件位址">
          </div>
          <div class="field">
            <label>密碼</label>
            <input type="password" name="password" placeholder="密碼">
          </div>
          <button class="ui blue button" type="submit">登入</button>
        </form>
        <div class="ui message">
          <div class="header">
            重新導向網址
          </div>
          <p>登入後，您將重新導向至：<code>${redirectUrl}</code></p>
        </div>
      </div>
    </body>
    </html>
    `);
    }
});
exports.ssoRouter.post('/login', (req, res, next) => {
    let redirectUrl = req.query.redirectUrl;
    let email = req.body.email;
    let password = req.body.password;
    // 在真實的系統中，將會針對電子郵件位址以及密碼進行認證
    // 但是，這個部分是 SSO 的工作，不再專案範圍
    // 已認證，產生代幣
    crypto.randomBytes(32, (err, buf) => {
        let token = buf.toString('hex');
        let exists = inMemoryDatabase.findIndex(record => record.email == email) >= 0;
        if (exists) {
            inMemoryDatabase.find(record => record.email == email).tokens.push(token);
        }
        else {
            inMemoryDatabase.push({
                email: email,
                tokens: [token]
            });
        }
        // 寫入 Cookie
        // res.cookie('sso-token', token)
        // 重新導向
        console.log('token = ', token);
        console.log('redirectUrl = ', redirectUrl);
        redirectUrl = redirectUrl + token;
        console.log('redirect to url: ' + redirectUrl);
        res.redirect(redirectUrl);
    });
});
exports.ssoRouter.post('/validate', (req, res, next) => {
    let token = req.body.token;
    if (!token) {
        next(new Error('要求主體不包含代幣（token）'));
    }
    else {
        let exists = inMemoryDatabase.findIndex(record => record.tokens.includes(token)) >= 0;
        if (exists) {
            let record = inMemoryDatabase.find(record => record.tokens.includes(token));
            record.tokens.splice(record.tokens.indexOf(token), 1);
            res.json({
                valid: true,
                email: record.email
            });
        }
        else {
            res.json({
                valid: false
            });
        }
    }
});
//# sourceMappingURL=sso.js.map