"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
const auth_1 = require('./../../util/auth');
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
    if (req.body.password.length < 6 || req.body.name.length == 0) {
        res.status(500).send();
        return;
    }
    auth_1.generatePassword(req.body.password).then(password => {
        models_1.User.create({
            email: req.body.email,
            name: req.body.name,
            password: password,
            group: "vendors",
            tokens: [],
            confirmed: false
        }).then(_ => res.status(201).send()).catch(next);
    }).catch(next);
});
//# sourceMappingURL=register.js.map