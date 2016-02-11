'use strict';
var express = require('express');
var mongoose = require('./util/mongoose');
// 中介軟體
var logger = require('morgan');
var bodyParser = require('body-parser');
// 路由器
var pieces = require('./routes/pieces');
var auth = require('./routes/auth');
var tokens = require('./routes/tokens');
var users = require('./routes/users');
var units = require('./routes/units');
let app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
// 允許第三方來源（Cross Origin）
// 允許標頭（Headers）
// 允許其他 HTTP 方法（POST、PUT 以及 DELETE）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'token, Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});
// 不允許快取
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
// 路徑
app.use('/pieces', pieces);
app.use('/auth', auth);
app.use('/tokens', tokens);
app.use('/users', users);
app.use('/units', units);
// 將 404 當作 500 處理
// 在這裡相當合適
app.use((req, res, next) => {
    next(new Error('資源不存在'));
});
// 記錄錯誤
app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.message);
    res.status(500).send(err.message);
});
module.exports = app;
//# sourceMappingURL=app.js.map