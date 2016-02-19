'use strict';
var express = require('express');
var auth = require('./../util/auth');
var models_1 = require('./../libs/models');
var router = express.Router();
/**
 * GET /units/units
 *
 * 取得所有單位。
 */
router.get('/', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Unit.find({}).exec()
            .then(units => res.json(units))
            .catch(next);
    })
        .catch(next);
});
/**
 * GET /units/freeUnits
 *
 * 取得沒有母單位的單位 ID。
 */
router.get('/freeUnits', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Unit.find({ parentUnit: undefined }).exec()
            .then(units => res.json(units.map(unit => unit.id)))
            .catch(next);
    })
        .catch(next);
});
/**
 * POST /units
 *
 * 新增一個單位。
 * 回傳新單位的 ID。
 */
router.post('/', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.Unit.create({})
            .then(doc => res.status(201).send(doc.id))
            .catch(next);
    })
        .catch(next);
});
/**
 * PUT /units/relateParent
 *
 * 更新單位親屬關係。
 */
router.put('/relateParent', (req, res, next) => {
    const parentUnitID = req.body.parent;
    const childUnitID = req.body.child;
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        if (parentUnitID == childUnitID) {
            next(new Error('不能將自己設為自己的母單位。'));
        }
        removeParent(childUnitID).then(() => {
            models_1.Unit.findByIdAndUpdate(parentUnitID, {
                $push: {
                    childUnits: childUnitID
                }
            }).exec().then(() => {
                models_1.Unit.findByIdAndUpdate(childUnitID, {
                    parentUnit: parentUnitID
                }).exec()
                    .then(() => res.sendStatus(200))
                    .catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /units/removeParents
 *
 * 解除單位親屬關係。
 */
router.put('/removeParent', (req, res, next) => {
    const parentUnitID = req.body.parent;
    const childUnitID = req.body.child;
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group).then(() => {
        models_1.Unit.findById(childUnitID).exec()
            .then(unit => {
            if (unit.parentUnit == parentUnitID) {
                removeParent(childUnitID).then(() => res.sendStatus(200))
                    .catch(next);
            }
            else {
                next(new Error('所指定移除的關係並不存在。'));
            }
        })
            .catch(next);
    }).catch(next);
});
/**
 * GET /units/usersInUnit/:id
 *
 * 回傳單位內的使用者。
 */
router.get('/usersInUnit/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.User.find({ unit: id }).exec()
            .then(users => res.json(users.map(user => user.id)))
            .catch(next);
    }).catch(next);
});
/**
 * GET /units/freeUsers
 *
 * 回傳無單位隸屬的使用者。
 */
router.get('/freeUsers', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.User.find({ unit: undefined }).exec()
            .then(users => res.json(users.map(user => user.id)))
            .catch(next);
    }).catch(next);
});
/**
 * DEPRECATED
 *
 * PUT /units/relateUser
 *
 * 更新使用者－單位關係。
 */
router.put('/relateUser', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const userID = req.body.user;
    const unitID = req.body.unit;
    auth.ensure_group(token, group).then(() => {
        models_1.User.findById(userID).exec().then(user => {
            if (!user.unit) {
                models_1.User.findByIdAndUpdate(userID, {
                    unit: unitID
                }).exec()
                    .then(doc => res.sendStatus(200))
                    .catch(next);
            }
            else {
                next(new Error('該使用者已經隸屬於一個單位。'));
            }
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /units/addUser
 *
 * 更新使用者－單位關係。
 */
router.put('/addUser', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const userID = req.body.user;
    const unitID = req.body.unit;
    auth.ensure_group(token, group).then(() => {
        models_1.User.findById(userID).exec().then(user => {
            if (!user.unit) {
                models_1.User.findByIdAndUpdate(userID, {
                    unit: unitID
                }).exec()
                    .then(doc => res.sendStatus(200))
                    .catch(next);
            }
            else {
                next(new Error('該使用者已經隸屬於一個單位。'));
            }
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /units/removeUser
 *
 * 從單位移除一個使用者。
 */
router.put('/removeUser', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const userID = req.body.user;
    const unitID = req.body.unit;
    auth.ensure_group(token, group)
        .then(() => {
        models_1.User.findById(userID).exec()
            .then(user => {
            if (!user.unit) {
                next(new Error('使用者並未隸屬任何單位。'));
            }
            else if (user.unit != unitID) {
                next(new Error('使用者並不隸屬該指定單位。'));
            }
            else {
                models_1.Unit.findById(unitID).exec()
                    .then(unit => {
                    if (unit.manager != userID && unit.docsControl != userID && unit.agents.indexOf(userID) < 0) {
                        models_1.User.findByIdAndUpdate(userID, {
                            unit: undefined
                        }).exec()
                            .then(() => res.sendStatus(200))
                            .catch(next);
                    }
                    else {
                        next(new Error('請先移除該使用者在該單位的職位。'));
                    }
                }).catch(next);
            }
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /units/assignRole
 *
 * 指派職責。
 */
router.put('/assignRole', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const userID = req.body.user;
    const unitID = req.body.unit;
    const role = req.body.role;
    auth.ensure_group(token, group).then(() => {
        models_1.User.findById(userID).exec().then(user => {
            if (!user.unit) {
                next(new Error('該使用者並不隸屬於任何單位。'));
            }
            else if (user.unit != unitID) {
                next(new Error('該使用者並非於該單位任職。'));
            }
            else {
                models_1.Unit.findById(unitID).exec().then(unit => {
                    if (role == 'manager') {
                        if (unit.manager && unit.manager != userID) {
                            next(new Error('單位的主管已有人任職。'));
                        }
                        else {
                            models_1.Unit.findByIdAndUpdate(unitID, {
                                manager: userID
                            }).exec()
                                .then(() => res.sendStatus(200))
                                .catch(next);
                        }
                    }
                    else if (role == 'docsControl') {
                        if (unit.docsControl && unit.docsControl != userID) {
                            next(new Error('單位的文管已有人任職。'));
                        }
                        else {
                            models_1.Unit.findByIdAndUpdate(unitID, {
                                docsControl: userID
                            }).exec()
                                .then(() => res.sendStatus(200))
                                .catch(next);
                        }
                    }
                    else if (role == 'agent') {
                        if (unit.agents.indexOf(userID) >= 0) {
                            next(new Error('該人員已經是承辦人之一。'));
                        }
                        else {
                            unit.agents.push(userID);
                            unit.save((err) => {
                                if (err) {
                                    next(err);
                                }
                                else {
                                    res.sendStatus(200);
                                }
                            });
                        }
                    }
                    else {
                        next(new Error('未知的職位。'));
                    }
                }).catch(next);
            }
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /units/deassignRole
 *
 * 解除職責。
 */
router.put('/deassignRole', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const userID = req.body.user;
    const unitID = req.body.unit;
    const role = req.body.role;
    auth.ensure_group(token, group).then(() => {
        models_1.Unit.findById(unitID).exec().then(unit => {
            if (role == 'manager') {
                if (unit.manager != userID) {
                    next(new Error('該單位的主管並非由此人員任職。'));
                }
                else {
                    models_1.Unit.findByIdAndUpdate(unitID, {
                        manager: undefined
                    }).exec().then(() => res.sendStatus(200)).catch(next);
                }
            }
            else if (role == 'docsControl') {
                if (unit.docsControl != userID) {
                    next(new Error('該單位的文管並非由此人員任職。'));
                }
                else {
                    models_1.Unit.findByIdAndUpdate(unitID, {
                        docsControl: undefined
                    }).exec().then(() => res.sendStatus(200)).catch(next);
                }
            }
            else if (role == 'agent') {
                if (unit.agents.indexOf(userID) < 0) {
                    next(new Error('該單位的承辦人並非由此人員任職。'));
                }
                else {
                    models_1.Unit.findByIdAndUpdate(unitID, {
                        $pull: {
                            agents: userID
                        }
                    }).exec().then(() => res.sendStatus(200)).catch(next);
                }
            }
            else {
                next(new Error('未知的職位。'));
            }
        }).catch(next);
    }).catch(next);
});
/**
 * GET /units/:id
 *
 * 取得單一單位的資訊。
 */
router.get('/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    auth.ensure_group(token, group).then(() => {
        models_1.Unit.findById(id).exec().then(unit => res.json(unit)).catch(next);
    }).catch(next);
});
/**
 * PUT /units/:id
 *
 * 更新單一單位的資訊。
 */
router.put('/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    auth.ensure_group(token, group).then(() => {
        // 刪除不應該用這個方法更新的資訊
        delete req.body.parentUnit;
        delete req.body.childUnits;
        delete req.body.manager;
        delete req.body.docsControl;
        delete req.body.agents;
        models_1.Unit.findByIdAndUpdate(id, {
            $set: req.body
        }).exec().then(doc => res.sendStatus(200)).catch(next);
    }).catch(next);
});
/**
 * DELETE /units/:id
 *
 * 刪除一個單位。
 */
router.delete('/:id', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const id = req.params.id;
    auth.ensure_group(token, group).then(() => {
        models_1.Unit.findById(id).exec().then(unit => {
            if (unit.parentUnit || unit.childUnits.length > 0) {
                next(new Error('該單位有母單位或是子單位不能刪除！'));
            }
            else if (unit.agents.length > 0 || unit.manager || unit.docsControl) {
                next(new Error('該單位有角色不能刪除！'));
            }
            else {
                models_1.User.find({ unit: id }).exec().then(users => {
                    if (users.length > 0) {
                        next(new Error('仍然有使用者屬於該單位，不能刪除！'));
                    }
                    else {
                        models_1.Unit.findByIdAndRemove(id).exec()
                            .then(() => res.sendStatus(200))
                            .catch(next);
                    }
                }).catch(next);
            }
        }).catch(next);
    }).catch(next);
});
/**
 * 工具函數
 */
/**
 * 移除指定子單位的母單位關係
 */
function removeParent(childUnitID) {
    return new Promise((resolve, reject) => {
        models_1.Unit.findById(childUnitID).exec().then((child) => {
            if (child.parentUnit) {
                models_1.Unit.findByIdAndUpdate(child.parentUnit, {
                    $pull: {
                        childUnits: childUnitID
                    }
                }).exec().then(function (newParent) {
                    models_1.Unit.findByIdAndUpdate(childUnitID, {
                        parentUnit: undefined
                    }).exec().then(function () {
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            }
            else {
                resolve();
            }
        }).catch(reject);
    });
}
module.exports = router;
//# sourceMappingURL=units.js.map