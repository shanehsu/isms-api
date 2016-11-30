"use strict";
const express = require("express");
const models_1 = require("./../../libs/models");
const auth_1 = require("./../../util/auth");
exports.registerRouter = express.Router();
exports.registerRouter.use((req, res, next) => {
    let group = req['group'];
    if (group == "guests") {
        next();
    }
    else {
        res.status(401).send();
    }
});
exports.registerRouter.post('/', (req, res, next) => {
    models_1.User.create({
        email: req.body.email,
        name: req.body.name,
        password: auth_1.generatePassword(req.body.password),
        group: "vendors",
        tokens: [],
        confirmed: false
    }).then(_ => res.status(201).send()).catch(next);
});
//# sourceMappingURL=register.js.map