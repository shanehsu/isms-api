'use strict';
const express = require("express");
const auth = require("./../util/auth");
const models_1 = require("./../libs/models");
var router = express.Router();
function signatureList(unitID, signatures, officer) {
    if (!signatures) {
        // 不需要簽核
        return Promise.resolve([]);
    }
    else {
        return new Promise((resolve, reject) => {
            models_1.Unit.findById(unitID).exec().then(unit => {
                // 檢察單位是否有主管（若需要的話）
                if (officer && !unit.manager) {
                    reject(new Error('單位沒有主管，無法建立紀錄。'));
                }
                else {
                    // 若有母單位，繼續搜尋
                    if (unit.parentUnit) {
                        signatureList(unit.parentUnit, true, true).then(nexts => {
                            if (officer) {
                                resolve([unit.manager, ...nexts]);
                            }
                            else {
                                resolve(nexts);
                            }
                        }).catch(reject);
                    }
                    else {
                        if (officer) {
                            resolve([unit.manager]);
                        }
                        else {
                            resolve([]);
                        }
                    }
                }
            });
        });
    }
}
/**
 * 回傳所有子單位（包含自己）
 * @param {string} unitID - 單位 ID
 */
function allChildUnits(unitID) {
    /**
     * 回傳子單位（不包含自己）
     * @param {string} unit - 單位 ID
     */
    function children(unit) {
        return new Promise((res, rej) => {
            models_1.Unit.findById(unit).then(unit => {
                if (unit.childUnits) {
                    res(unit.childUnits);
                }
                else {
                    res([]);
                }
            }).catch(rej);
        });
    }
    /**
     * 回傳子單位（包含自己）
     * @param {string} unit - 單位 ID
     */
    function recurse(unit) {
        // 找到自己的小孩
        return new Promise((res, rej) => {
            children(unit).then(myChildren => {
                // 如果沒有小孩
                if (myChildren.length == 0) {
                    res([unit]);
                    return;
                }
                // 如果有小孩
                let promises = [];
                for (let child of myChildren) {
                    promises.push(recurse(child));
                }
                Promise.all(promises).then(c => {
                    let grand = c.reduce((a, b) => [...a, ...b], []);
                    res([unit, ...grand]);
                });
            });
        });
    }
    return recurse(unitID);
    // return new Promise<string[]>((resolve, reject) => {
    //   Unit.findById(unitID).exec().then(unit => {
    //     if (!unit.childUnits || unit.childUnits.length == 0) {
    //       resolve([unitID])
    //     } else {
    //       let children: string[] = unit.childUnits
    //       let grandChildren: string[] = []
    //       function recursiveFunction(index: number): void {
    //         if (index == children.length) {
    //           resolve([unitID, ...children, ...grandChildren])
    //         } else {
    //           allChildUnits(children[index]).then(itsChild => {
    //             grandChildren.push(...itsChild)
    //             index ++
    //             recursiveFunction(index)
    //           }).catch(reject)
    //         }
    //       }
    //       recursiveFunction(1)
    //     }
    //   })
    // })
}
router.get('/', (req, res, next) => {
    const token = req.get('token');
    let respondWithDocs = (docs) => {
        if (req.query && req.query.populate && req.query.populate == 'true') {
            // 把 ID 換成文件
            // 需要更換的部分有：
            // owner, owningUnit, formID, formRevision
            // 記錄有沒有任何資料庫操作失敗了
            let databaseOperationErrored = false;
            // 先記錄有哪些不同的 ID 必須收集
            let uniqueUserIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.owner)) {
                    return prev;
                }
                else {
                    return [...prev, value.owner];
                }
            }, []);
            let uniqueUnitIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.owningUnit)) {
                    return prev;
                }
                else {
                    return [...prev, value.owningUnit];
                }
            }, []);
            let uniqueFormIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.formID)) {
                    return prev;
                }
                else {
                    return [...prev, value.formID];
                }
            }, []);
            // 開始進行資料庫操作
            let userQueryPromise = models_1.User.find({ _id: { $in: uniqueUserIDs } }).exec();
            let unitQueryPromise = models_1.Unit.find({ _id: { $in: uniqueUnitIDs } }).exec();
            let formQueryPromise = models_1.Form.find({ _id: { $in: uniqueFormIDs } }).exec();
            Promise.all([userQueryPromise, unitQueryPromise, formQueryPromise]).then(values => {
                var [users, units, forms] = values;
                res.json(docs.map(doc => {
                    // owner, owningUnit, formID, formRevision
                    let form = forms.find(form => form.id == doc.formID);
                    let revision = form.revisions.find(rev => rev.id == doc.formRevision);
                    let owner = users.find(user => user.id == doc.owner);
                    let unit = units.find(unit => unit.id == doc.owningUnit);
                    return {
                        id: doc.id,
                        created: doc.created,
                        form: {
                            id: form.id,
                            name: form.name
                        },
                        revision: {
                            id: revision.id,
                            version: revision.revision
                        },
                        owner: {
                            id: owner.id,
                            name: owner.name
                        },
                        owningUnit: {
                            id: unit.id,
                            identifier: unit.identifier,
                            name: unit.name
                        },
                        serial: doc.serial,
                        signatures: doc.signatures
                    };
                }));
            }).catch(next);
        }
        else {
            res.json(docs);
        }
    };
    auth.return_user(token).then(user => {
        const userID = user.id;
        // 先看是不是文管人員或是主管
        if (user.unit) {
            models_1.Unit.findById(user.unit).exec().then(unit => {
                if (unit.docsControl == userID || unit.manager == userID) {
                    allChildUnits(user.unit).then(units => {
                        let unitIDs = units;
                        models_1.Record.find({
                            $or: [
                                {
                                    owner: userID
                                },
                                {
                                    owningUnit: {
                                        $in: unitIDs
                                    }
                                }
                            ]
                        }, { data: 0 }).sort({ created: 'descending' }).exec()
                            .then(respondWithDocs)
                            .catch(next);
                    }).catch(() => next(new Error('無法取得所有子單位的 ID。')));
                }
                else {
                    // 自己的表單
                    models_1.Record.find({ owner: userID }, { data: 0 }).sort({ created: 'descending' }).exec()
                        .then(respondWithDocs)
                        .catch(next);
                }
            });
        }
        else {
            // 自己的表單
            models_1.Record.find({ owner: userID }, { data: 0 }).sort({ created: 'descending' }).exec()
                .then(respondWithDocs)
                .catch(next);
        }
    }).catch(next);
});
router.get('/:id', (req, res, next) => {
    const token = req.get('token');
    function respondWith(record) {
        let userQueries = [record.owner, ...record.signatures.map(v => v.personnel)];
        let unitsOfUsersQueries = record.signatures.map(v => v.personnel);
        let userQueryPromise = models_1.User.find({ _id: { $in: userQueries } }).exec();
        let formQueryPromise = models_1.Form.find({ _id: record.formID }).exec();
        let unitsQueryPromise = models_1.Unit.find({ $or: [
                { _id: record.owningUnit },
                { manager: { $in: unitsOfUsersQueries } },
                { docsControl: { $in: unitsOfUsersQueries } },
                { agents: { $in: unitsOfUsersQueries } }
            ] }).exec();
        Promise.all([userQueryPromise, unitsQueryPromise, formQueryPromise]).then(values => {
            let [users, units, form] = values;
            let response = {
                id: record.id,
                created: record.created,
                form: {
                    id: record.formID,
                    name: form[0].name
                },
                revision: {
                    id: record.formRevision,
                    version: form[0].revisions.find(r => r.id == record.formRevision).revision
                },
                owner: {
                    id: record.owner,
                    name: users.find(u => u.id == record.owner).name
                },
                owningUnit: {
                    id: record.owningUnit,
                    identifier: units.find(u => u.id == record.owningUnit).identifier.toString(),
                    name: units.find(u => u.id == record.owningUnit).name
                },
                serial: record.serial,
                data: record.data,
                signatures: record.signatures.map(s => {
                    let userUnit = units.find(u => {
                        return (u.manager && u.manager.toString() == s.personnel) ||
                            (u.docsControl && u.docsControl.toString() == s.personnel) ||
                            (u.agents && u.agents.find(u => u.toString() == s.personnel) != undefined);
                    });
                    return {
                        personnel: {
                            id: s.personnel,
                            name: users.find(u => u.id == s.personnel).name
                        },
                        signed: s.signed,
                        timestamp: s.timestamp,
                        unit: userUnit.name,
                        role: userUnit.docsControl == s.personnel ? '文管' : userUnit.manager == s.personnel ? '主管' : '承辦人'
                    };
                })
            };
            res.json(response);
        }).catch(next);
    }
    auth.return_user(token).then(user => {
        const recordID = req.params.id;
        models_1.Record.findById(recordID).then(record => {
            // 看是不是自己的！
            if (record.owner == user.id) {
                // 是本人的！
                respondWith(record);
            }
            else {
                // 非本人，檢查該人是不是文管或是主管
                if (user.unit) {
                    models_1.Unit.findById(user.unit).then(unit => {
                        // 檢查使用者是不是這個單位的文管或是主管
                        if (unit.docsControl == user.id || unit.manager == user.id) {
                            // 檢查單位從屬關係
                            if (record.owningUnit == user.unit) {
                                respondWith(record);
                            }
                            else {
                                allChildUnits(user.unit).then(childUnitIDs => {
                                    console.dir(record.owningUnit.toString());
                                    console.dir(childUnitIDs.map(x => x.toString()));
                                    if (childUnitIDs.map(x => x.toString()).indexOf(record.owningUnit.toString()) >= 0) {
                                        respondWith(record);
                                    }
                                    else {
                                        next(new Error('這個紀錄不屬於你'));
                                    }
                                }).catch(next);
                            }
                        }
                        else {
                            next(new Error('這個紀錄不屬於你'));
                        }
                    }).catch(next);
                }
                else {
                    next(new Error('這個紀錄不屬於你'));
                }
            }
        }).catch(next);
    }).catch(next);
});
router.post('/sign/:id', (req, res, next) => {
    const token = req.get('token');
    const id = req.params.id;
    auth.return_user(token).then(user => {
        models_1.Record.findById(id).then(record => {
            let i = record.signatures.findIndex(s => s.personnel == user.id);
            if (i < 0) {
                next(new Error('你不在簽核鏈之中！'));
            }
            else {
                if (record.signatures[i - 1].signed) {
                    models_1.Record.update({
                        _id: id,
                        "signatures.personnel": user.id
                    }, {
                        $set: {
                            "signatures.$.signed": true,
                            "signatures.$.timestamp": new Date()
                        }
                    }).then(() => res.sendStatus(200)).catch(next);
                }
                else {
                    next(new Error('現在還不能簽名呦'));
                }
            }
        }).catch(next);
    }).catch(next);
});
router.get('/sign', (req, res, next) => {
    const token = req.get('token');
    auth.return_user(token).then(user => {
        models_1.Record.find({
            signatures: {
                $elemMatch: {
                    personnel: user.id,
                    signed: true
                }
            }
        }).then(records => {
            let docs = records.filter(r => {
                let i = r.signatures.findIndex(s => s.personnel == user.id);
                return r.signatures[i - 1].signed;
            });
            // 先記錄有哪些不同的 ID 必須收集
            let uniqueUserIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.owner)) {
                    return prev;
                }
                else {
                    return [...prev, value.owner];
                }
            }, []);
            let uniqueUnitIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.owningUnit)) {
                    return prev;
                }
                else {
                    return [...prev, value.owningUnit];
                }
            }, []);
            let uniqueFormIDs = docs.reduce((prev, value) => {
                if (prev.includes(value.formID)) {
                    return prev;
                }
                else {
                    return [...prev, value.formID];
                }
            }, []);
            // 開始進行資料庫操作
            let userQueryPromise = models_1.User.find({ _id: { $in: uniqueUserIDs } }).exec();
            let unitQueryPromise = models_1.Unit.find({ _id: { $in: uniqueUnitIDs } }).exec();
            let formQueryPromise = models_1.Form.find({ _id: { $in: uniqueFormIDs } }).exec();
            Promise.all([userQueryPromise, unitQueryPromise, formQueryPromise]).then(values => {
                var [users, units, forms] = values;
                res.json(docs.map(doc => {
                    // owner, owningUnit, formID, formRevision
                    let form = forms.find(form => form.id == doc.formID);
                    let revision = form.revisions.find(rev => rev.id == doc.formRevision);
                    let owner = users.find(user => user.id == doc.owner);
                    let unit = units.find(unit => unit.id == doc.owningUnit);
                    return {
                        id: doc.id,
                        created: doc.created,
                        form: {
                            id: form.id,
                            name: form.name
                        },
                        revision: {
                            id: revision.id,
                            version: revision.revision
                        },
                        owner: {
                            id: owner.id,
                            name: owner.name
                        },
                        owningUnit: {
                            id: unit.id,
                            identifier: unit.identifier,
                            name: unit.name
                        },
                        serial: doc.serial,
                        signatures: doc.signatures
                    };
                }));
            }).catch(next);
        }).catch(next);
    }).catch(next);
});
// 取得某一個表單的表單形狀
router.get('/:formID/:revisionID/schema', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    // 驗證使用者是否有資格填寫該表單
    auth.return_user(token).then(user => {
        // 取得使用者資料
        // 現在只看使用者是否有足夠權限（群組資格）
        const userGroup = user.group;
        models_1.Form.findById(formID).exec().then(form => {
            const revision = form.revisions.find(rev => rev.id == revisionID);
            const formGroup = revision.group;
            if (userGroup <= formGroup) {
                // 使用者有足夠權限！
                res.json(revision.fields);
            }
            else {
                next(new Error("權限不足。"));
            }
        }).catch(next);
    });
});
router.get('/:formID/schema', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    // 驗證使用者是否有資格填寫該表單
    auth.return_user(token).then(user => {
        // 取得使用者資料
        // 現在只看使用者是否有足夠權限（群組資格）
        const userGroup = user.group;
        models_1.Form.findById(formID).exec().then(form => {
            const publishedRevisions = form.revisions.filter(revision => revision.published);
            const latestFormRevision = publishedRevisions[publishedRevisions.length - 1];
            const formGroup = latestFormRevision.group;
            if (userGroup <= formGroup) {
                // 使用者有足夠權限！
                res.json(latestFormRevision.fields);
            }
            else {
                next(new Error("權限不足。"));
            }
        }).catch(next);
    });
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
                if (!form.revisions || form.revisions.filter(revision => revision.published).length == 0) {
                    next(new Error('表單沒有可填寫的表單版本。'));
                    return;
                }
                let officerSignature = form.revisions[form.revisions.length - 1].officerSignature;
                let signatures = form.revisions[form.revisions.length - 1].signatures;
                let publishedRevisions = form.revisions.filter(revision => revision.published);
                let revisionID = publishedRevisions[publishedRevisions.length - 1].id;
                models_1.Record.aggregate().match({
                    owningUnit: unitID
                }).project({
                    serial: true,
                    year: {
                        $year: "$created"
                    }
                }).match({
                    year: { $eq: new Date().getUTCFullYear() }
                }).sort({
                    serial: -1
                }).limit(1).project({
                    _id: false,
                    serial: true
                }).then(record => {
                    let serial = 1;
                    if (record.length == 1) {
                        serial = record[0].serial + 1;
                    }
                    signatureList(unitID, signatures, officerSignature).then(chain => {
                        // 把自己加進簽核鍊之中！
                        let signaturesChain = [userID, ...chain];
                        let signaturesArray = signaturesChain.map(element => {
                            return {
                                personnel: element,
                                timestamp: new Date(),
                                signed: false
                            };
                        });
                        // 自己送出表單時，視同進行簽名
                        signaturesArray[0].signed = true;
                        models_1.Record.create({
                            formID: formID,
                            formRevision: revisionID,
                            owningUnit: unitID,
                            serial: serial,
                            owner: userID,
                            signatures: signaturesArray,
                            data: req.body.data
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
    auth.ensure_group(token, 1).then(() => {
        // 以管理員的身份
        models_1.Record.findByIdAndRemove(recordID).exec()
            .then(() => res.sendStatus(200)).catch(next);
    }).catch(() => {
        auth.return_user(token).then(user => {
            let userID = user.id;
            models_1.Record.findById(recordID).exec().then(record => {
                if (record.owner == userID) {
                    // 以建檔人的身份
                    models_1.Record.findByIdAndRemove(recordID).exec()
                        .then(() => res.sendStatus(200)).catch(next);
                }
                else {
                    // 以單位主管、文管的身份
                    let thisUnit = record.owningUnit;
                    let recursiveFunction = function (unit) {
                        models_1.Unit.findById(unit).exec().then(unit => {
                            if (unit.docsControl == userID || unit.manager == userID) {
                                models_1.Record.findByIdAndRemove(recordID).exec()
                                    .then(() => res.sendStatus(200)).catch(next);
                            }
                            else {
                                if (unit.parentUnit) {
                                    return recursiveFunction(unit.parentUnit);
                                }
                                else {
                                    next(new Error('你並非管理員、建檔人、或是單位主管或文管人員。'));
                                }
                            }
                        }).catch(next);
                    };
                    recursiveFunction(thisUnit);
                }
            }).catch(next);
        }).catch(next);
    });
});
module.exports = router;
//# sourceMappingURL=records.js.map