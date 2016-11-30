"use strict";
const express = require("express");
const auth_1 = require("./../../util/auth");
const login_1 = require("./login");
const news_1 = require("./news");
const users_1 = require("./users");
const me_1 = require("./me");
const register_1 = require("./register");
exports.V2Router = express.Router();
exports.V2Router.use((req, res, next) => {
    let token = req.get('token');
    if (token != undefined) {
        auth_1.returnUser(token).then(user => {
            req['user'] = user;
            req['authenticated'] = true;
            req['group'] = user.group;
            next();
        }).catch(err => next(err));
    }
    else {
        req['user'] = undefined;
        req['authenticated'] = false;
        req['group'] = 'guests';
        next();
    }
});
exports.V2Router.use('/login', login_1.loginRouter);
exports.V2Router.use('/news', news_1.newsRouter);
exports.V2Router.use('/users', users_1.usersRouter);
exports.V2Router.use('/me', me_1.meRouter);
exports.V2Router.use('/register', register_1.registerRouter);
//# sourceMappingURL=main.js.map