'use strict';
var express = require('express');
var auth = require('./../util/auth');
var models_1 = require('./../libs/models');
var router = express.Router();
function signatureList(unitID, signatures) {
    if (signatures < 1) {
        return Promise.resolve([]);
    }
    return new Promise((resolve, reject) => {
        models_1.Unit.findById(unitID).exec().then(unit => {
            if (!unit.manager) {
                reject(new Error('簽核鏈中有單位沒有主管，無法建立記錄。'));
            }
            else {
                let thisManager = unit.manager;
                if (signatures == 1) {
                    resolve([thisManager]);
                }
                else {
                    // 查找母單位
                    if (!unit.parentUnit) {
                        reject(new Error('簽核鏈中有單位沒有母單位，無法建立記錄。'));
                    }
                    else {
                        signatureList(unit.parentUnit, signatures - 1).then(nextManagers => {
                            resolve([thisManager, ...nextManagers]);
                        }).catch(reject);
                    }
                }
            }
        }).catch(reject);
    });
}
router.get('/', (req, res, next) => {
    const token = req.get('token');
    auth.return_user(token).then(user => {
        const userID = user.id;
        if (req.query.scope == undefined) {
            models_1.Record.find({ owner: userID }).sort({ created: 'descending' }).exec()
                .then(docs => res.json(docs))
                .catch(next);
        }
        else if (req.query.scope == 'unit') {
        }
    }).catch(next);
});
router.post('/:formID', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    auth.return_user(token).then(user => {
        const userID = user.id;
        const unitID = user.unit;
        models_1.Unit.findById(unitID).exec().then(unit => {
            if (unit.agents.indexOf(userID) == -1) {
                next(new Error('不是承辦人無法填寫表單。'));
                return;
            }
            models_1.Form.findById(formID).exec().then(form => {
                if (!form.revisions || form.revisions.length == 0) {
                    next(new Error('表單沒有可填寫的表單版本。'));
                    return;
                }
                let signatures = form.revisions[form.revisions.length - 1].signatures;
                let revisionID = form.revisions[form.revisions.length - 1].id;
                models_1.Record.find({ owningUnit: unitID }).sort({ serial: 'ascending' })
                    .select('serial').limit(1).exec().then(records => {
                    let serial = 1;
                    if (records.length == 1) {
                        serial = records[0].serial + 1;
                    }
                    signatureList(unitID, signatures).then(chain => {
                        let signaturesChain = chain;
                        let signaturesArray = signaturesChain.map(element => {
                            return {
                                personnel: element,
                                signed: false
                            };
                        });
                        models_1.Record.create({
                            formID: formID,
                            formRevision: revisionID,
                            owningUnit: unitID,
                            serial: serial,
                            owner: userID,
                            signatures: signaturesArray
                        }).then(record => res.send(record.id)).catch(next);
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});
router.put('/:recordID', (req, res, next) => {
    const token = req.get('token');
    const recordID = req.params.recordID;
    auth.return_user(token).then(user => {
        let userID = user.id;
        models_1.Record.findById(recordID).exec().then(record => {
            if (record.owner != userID) {
                next(new Error('只有建檔人可以填寫表單記錄。'));
                return;
            }
            try {
                record.data = req.body;
            }
            catch (e) {
                next(new Error('無法儲存表單記錄'));
            }
            record.save(err => {
                if (err) {
                    next(err);
                }
                else {
                    res.sendStatus(200);
                }
            });
        }).catch(next);
    }).catch(next);
});
// 增加管理員、文管人員、單位主管可以刪除表單的功能！
router.delete('/:recordID', (req, res, next) => {
    const token = req.get('token');
    const recordID = req.params.recordID;
    auth.return_user(token).then(user => {
        let userID = user.id;
        models_1.Record.findById(recordID).exec().then(record => {
            if (record.owner != userID) {
                next(new Error('只有建檔人可以刪除記錄。'));
                return;
            }
            models_1.Record.findByIdAndRemove(recordID).exec()
                .then(() => res.sendStatus(200)).catch(next);
        }).catch(next);
    }).catch(next);
});
//# sourceMappingURL=record.js.map