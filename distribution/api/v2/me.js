"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
const auth_1 = require('./../../util/auth');
exports.meRouter = express.Router();
exports.meRouter.use((req, res, next) => {
    if (req.method.toLowerCase() == 'options') {
        next();
        return;
    }
    if (req['group'] == 'guests') {
        res.status(401).send();
    }
    else {
        next();
    }
});
exports.meRouter.get('/', (req, res, next) => {
    let user = req['user'];
    models_1.Unit.find({
        "$or": [
            { "members.none": user.id },
            { "members.docsControl": user.id },
            { "members.agent": user.id },
            { "members.manager": user.id }
        ]
    }).then(units => {
        if (units.length > 0) {
            let unit = units[0];
            unit.role = {
                agent: unit.members.agents.includes(user.id),
                manager: unit.members.manager == user.id,
                docsControl: unit.members.docsControl == user.id
            };
            delete unit._id;
            delete unit.members;
            delete unit.parentUnit;
            user.unit = unit;
        }
        delete user.password;
        res.json(user);
    }).catch(next);
});
exports.meRouter.delete('/tokens/:tokenID', (req, res, next) => {
    models_1.User.findByIdAndUpdate(req['user'].id, { $pull: { tokens: { _id: req.params.tokenID } } }).then(_ => res.status(204).send()).catch(next);
});
exports.meRouter.put('/password', (req, res, next) => {
    auth_1.generatePassword(req.body.password).then(password => {
        models_1.User.findOneAndUpdate({ _id: req.params.id, group: 'vendors' }, { $set: { password: password } }).then(_ => res.status(204).send()).catch(next);
    }).catch(next);
});
//# sourceMappingURL=me.js.map