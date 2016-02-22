'use strict';
var express = require('express');
var auth = require('./../util/auth');
var models_1 = require('./../libs/models');
// 路由器前置路徑 /forms/revisions/fields
var router = express.Router();
/**
 * GET /forms/revisions/fields/:formID/:revisionID/:fieldID
 *
 * 取得特定的表單欄位
 */
router.get('/:formID/:revisionID/:fieldID', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    const fieldID = req.params.fieldID;
    auth.return_user(token).then(user => {
        models_1.Form.findById(formID).exec().then(form => {
            let revisions = form.revisions;
            let filteredRevision = revisions.filter(revision => revision.id == revisionID);
            if (filteredRevision.length == 0) {
                next(new Error('在表單內找不到此表單版本。'));
            }
            else {
                let revision = filteredRevision[0];
                let fields = revision.fields;
                let filteredField = fields.filter(field => field.id == fieldID);
                if (filteredField.length == 0) {
                    next(new Error('在表單版本內找不到此欄位。'));
                }
                else {
                    let field = filteredField[0];
                    res.json(field);
                }
            }
        }).catch(next);
    }).catch(next);
});
/**
 * POST /forms/revisions/fields/:formID/:revisionID
 */
router.post('/:formID/:revisionID', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    auth.ensure_group(token, group).then(user => {
        models_1.Form.findById(formID).exec().then(form => {
            // 取得表單版本
            let revisions = form.revisions;
            let revisionIndex = revisions.findIndex(revision => revision.id == revisionID);
            if (revisionIndex < 0) {
                next(new Error('無法找到該表單版本。'));
                return;
            }
            // 更新前 ID
            let oldFieldIDs = [];
            if (revisions[revisionIndex].fields) {
                oldFieldIDs = revisions[revisionIndex].fields.map(field => field.id);
            }
            // 更新
            let keyPath = 'revisions.' + revisionIndex + '.fields';
            let update = {};
            update[keyPath] = {};
            models_1.Form.findByIdAndUpdate(formID, {
                '$push': update
            }, {
                'new': true
            }).exec().then((newForm) => {
                // 取得新的欄位 ID
                let newRevisions = newForm.revisions;
                let newRevisionIndex = newRevisions.findIndex(revision => revision.id == revisionID);
                if (newRevisionIndex < 0) {
                    next(new Error('無法取得新欄位的 ID，在查找表單版本時失敗。'));
                    return;
                }
                // 更新後 ID
                let newFieldIDs = newRevisions[newRevisionIndex].fields.map(field => field.id);
                let diff = newFieldIDs.filter(id => oldFieldIDs.indexOf(id) == -1);
                if (diff.length != 1) {
                    next(new Error('無法查出新欄位 ID，計算差異時失敗。'));
                }
                else {
                    res.send(diff[0]);
                }
            }).catch(next);
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /forms/revisions/fields/:formID/:revisionID/:fieldID
 */
router.put('/:formID/:revisionID/:fieldID', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    const fieldID = req.params.fieldID;
    auth.ensure_group(token, 1).then(() => {
        models_1.Form.findById(formID).exec().then(form => {
            // 表單版本
            let revisions = form.revisions;
            let revisionIndex = revisions.findIndex(revision => revision.id == revisionID);
            if (revisionIndex == -1) {
                next(new Error('找不到指定的表單版本。'));
                return;
            }
            let revision = revisions[revisionIndex];
            // 欄位
            let fields = revision.fields;
            let fieldIndex = fields.findIndex(field => field.id == fieldID);
            if (fieldIndex == -1) {
                next(new Error('找不到指定的欄位。'));
                return;
            }
            let field = fields[fieldIndex];
            // 進行更新
            if (req.body.name != undefined)
                field.name = req.body.name;
            if (req.body.type != undefined)
                field.type = req.body.type;
            if (req.body.hint != undefined)
                field.hint = req.body.hint;
            if (req.body.metadata != undefined) {
                try {
                    field.metadata = JSON.parse(req.body.metadata);
                }
                catch (e) {
                    next(e);
                }
            }
            console.dir(field);
            form.markModified('revisions.' + revisionIndex + '.fields.' + fieldIndex);
            form.save(err => {
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
/**
 * DELETE /forms/revisions/fields/:formID/:revisionID/:fieldID
 */
router.delete('/:formID/:revisionID/:fieldID', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    const fieldID = req.params.fieldID;
    auth.ensure_group(token, 1).then(() => {
        models_1.Form.findById(formID).exec().then(form => {
            // 表單版本
            let revisions = form.revisions;
            let revisionIndex = revisions.findIndex(revision => revision.id == revisionID);
            if (revisionIndex == -1) {
                next(new Error('找不到指定的表單版本。'));
                return;
            }
            let keyPath = 'revisions.' + revisionIndex + '.fields';
            let update = {};
            update[keyPath] = { _id: fieldID };
            models_1.Form.findByIdAndUpdate(formID, {
                '$pull': update
            }).exec().then(() => res.sendStatus(200)).catch(next);
        }).catch(next);
    }).catch(next);
});
module.exports = router;
/*

router.get('/:formID/:revisionID/:fieldID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
})

*/ 
//# sourceMappingURL=forms.revisions.fields.js.map