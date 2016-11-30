'use strict';
const express = require("express");
const middlewares_1 = require("./util/middlewares");
const api_1 = require("./api/api");
const sso_1 = require("./sso");
var mongoose = require('./util/mongoose');
var colors = require('colors/safe');
var logger = require('morgan')('dev');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json();
let app = express();
// 中介軟體
app.use(logger);
app.use(cookieParser());
app.use(jsonParser);
app.use(urlEncodedParser);
app.use(middlewares_1.corsHeader);
app.use(middlewares_1.noCache);
app.use(middlewares_1.randomResponseTimeDelay);
// 路由
app.use('/api', api_1.APIRouter);
app.use('/sso', sso_1.ssoRouter);
// 404 處理常式
app.use((req, res, next) => {
    res.status(404).json({
        message: "無法找到你所需要的資源。"
    });
});
// 錯誤處理常式
app.use((err, req, res, next) => {
    console.log(colors.yellow('錯誤紀錄'));
    console.dir(err);
    res.status(500).json({
        message: err.message,
        object: err
    });
});
module.exports = app;
//# sourceMappingURL=app.js.map