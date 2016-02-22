'use strict';
var express = require('express');
var auth = require('./../util/auth');
var models_1 = require('./../libs/models');
// 路由器前置路徑 /forms/revisions
var router = express.Router();
// 子路由器
router.use('/fields', require('./forms.revisions.fields'));
/**
 * GET /forms/revisions/:formID/:revisionID
 *
 * 取得特定表單的某個表單版本
*/
router.get('/:formID/:revisionID', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    auth.return_user(token).then(user => {
        let group = user.group;
        models_1.Form.findById(formID).exec().then(form => {
            let filtered = form.revisions.filter(revision => revision.id == revisionID);
            if (filtered.length == 0) {
                next(new Error('在表單內找不到此表單版本。'));
            }
            else {
                let revision = filtered[0];
                let payload = {
                    _id: revision._id,
                    revision: revision.revision,
                    signatures: revision.signatures,
                    group: revision.group,
                    secrecyLevel: revision.secrecyLevel,
                    template: revision.template
                };
                if (revision.fields) {
                    payload.fields = revision.fields.map(field => field.id);
                }
                res.json(payload);
            }
        }).catch(next);
    }).catch(next);
});
/**
 * POST /forms/revisions/:formID
 */
router.post('/:formID', (req, res, next) => {
    const token = req.get('token');
    const formID = req.params.formID;
    auth.return_user(token).then(user => {
        let group = user.group;
        models_1.Form.findById(formID).exec().then(form => {
            // 紀錄新增前的 ID
            let oldIDs;
            if (form.revisions) {
                oldIDs = form.revisions.map(revision => revision.id);
            }
            else {
                oldIDs = [];
            }
            // 找出原本的版本
            let nextRevision = 1;
            if (form.revisions && form.revisions.length > 0) {
                let latestRevision = form.revisions[form.revisions.length - 1];
                let revision = latestRevision.revision;
                nextRevision = Math.round((revision + 0.1) * 10) / 10;
            }
            models_1.Form.findByIdAndUpdate(formID, {
                '$push': {
                    revisions: {
                        revision: nextRevision,
                    }
                }
            }, { 'new': true }).exec().then(newForm => {
                let newIDs = newForm.revisions.map(revision => revision.id);
                let diff = newIDs.filter(id => oldIDs.indexOf(id) == -1);
                if (diff.length != 1) {
                    next(new Error('無法查出新表單版本 ID。'));
                }
                else {
                    res.send(diff[0]);
                }
            }).catch(next);
        }).catch(next);
    }).catch(next);
});
/**
 * PUT /forms/revisions/:formID/:revisionID
 */
router.put('/:formID/:revisionID', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    auth.ensure_group(token, group).then(user => {
        models_1.Form.findById(formID).exec().then(form => {
            let index = form.revisions.findIndex(revision => revision.id == revisionID);
            if (index < 0) {
                next(new Error('無法找到該表單版本。'));
                return;
            }
            let revision = form.revisions[index];
            // 開始進行 Document Merging
            if (req.body.revision != undefined)
                revision.revision = req.body.revision;
            if (req.body.signatures != undefined)
                revision.signatures = req.body.signatures;
            if (req.body.group != undefined)
                revision.group = req.body.group;
            if (req.body.secrecyLevel != undefined)
                revision.secrecyLevel = req.body.secrecyLevel;
            if (req.body.template != undefined)
                revision.template = req.body.template;
            form.markModified('form.revisions.' + index);
            form.save((err) => {
                if (err)
                    next(err);
                else
                    res.sendStatus(200);
            });
        }).catch(next);
    }).catch(next);
});
/**
 * DELETE /forms/revisions/:formID/:revisionID
 */
router.delete('/:formID/:revisionID', (req, res, next) => {
    const token = req.get('token');
    const group = 1;
    const formID = req.params.formID;
    const revisionID = req.params.revisionID;
    auth.ensure_group(token, group).then(user => {
        models_1.Form.findByIdAndUpdate(formID, {
            '$pull': {
                revisions: { _id: revisionID }
            }
        }).exec().then(() => res.sendStatus(200)).catch(next);
    }).catch(next);
});
module.exports = router;
/*

== GET ==

router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
})

*/ 
//# sourceMappingURL=forms.revisions.js.map