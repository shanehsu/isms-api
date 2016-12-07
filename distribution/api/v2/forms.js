"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
exports.formsRouter = express.Router();
exports.formsRouter.use((req, res, next) => {
    if (req['group'] == 'guests') {
        res.status(401).send();
    }
    else {
        next();
    }
});
exports.formsRouter.get('/', (req, res, next) => {
    /* Notes
     * There are three scopes associated with "Forms" collection,
     * *admin* and *fill*
     * One may only be using the *admin* scope, if one is an admin,
     * and requests that scope through ?scope=admin
     */
    if (req['group'] == 'admins' && req.query.scope && req.query.scope == 'admin') {
        // the *admin* scope
        models_1.Form.aggregate({
            "$project": {
                "identifier": true,
                "name": true,
                "revisions": "$revisions.revision"
            }
        }).then(forms => res.json(forms)).catch(next);
    }
    else {
        // the *fill* scope
        let matchObject = {};
        matchObject['latestRevision.group.' + req['group']] = true;
        models_1.Form.aggregate([
            {
                "$project": {
                    "identifier": true,
                    "name": true,
                    "revisions": false,
                    "latestRevision": {
                        "$arrayElemAt": [{ "$slice": ["$revisions", -1] }, 0]
                    }
                }
            }, {
                "$match": matchObject
            }
        ]).then(forms => res.json(forms)).catch(next);
    }
});
exports.formsRouter.get('/:id', (req, res, next) => {
    let formID = req.params.id;
    /* Notes
     * There are three scopes associated with "Forms" collection,
     * *admin* and *view*
     * One may only be using the *admin* scope, if one is an admin,
     * and requests that scope through ?scope=admin
     * In the *view* scope, the user can request specific revision through,
     * ?revision=1.3
     * If none was given, then the latest is always retrieved unless not
     * authorized.
     */
    if (req['group'] == 'admins' && req.query.scope && req.query.scope == 'admin') {
        models_1.Form.findById(formID).then(form => res.json(form)).catch(next);
    }
    else {
        models_1.Form.findById(formID).then(form => {
            if (req.query.revision) {
                // The user wants specific revision
                let revision = +req.query.revision;
                models_1.Form.aggregate([
                    {
                        "$match": {
                            "_id": formID
                        }
                    }, {
                        "$unwind": "revisions"
                    }, {
                        "$project": {
                            "identifier": true,
                            "name": true,
                            "revision": "revisions"
                        }
                    }, {
                        "$match": {
                            "revision.revision": +req.query.revision
                        }
                    }
                ]).then((form) => {
                    if (form.revision.group[req['group']]) {
                        res.json(form);
                    }
                    else {
                        res.status(401).send();
                    }
                }).catch(next);
            }
            else {
                // The user wants the latest revision
                models_1.Form.aggregate([
                    {
                        "$match": {
                            "_id": formID
                        }
                    }, {
                        "$project": {
                            "identifier": true,
                            "name": true,
                            "revisions": false,
                            "revision": {
                                "$arrayElemAt": [{ "$slice": ["$revisions", -1] }, 0]
                            }
                        }
                    }
                ]).then((form) => {
                    if (form.revision.group[req['group']]) {
                        res.json(form);
                    }
                    else {
                        res.status(401).send();
                    }
                }).catch(next);
            }
        }).catch(next);
    }
});
exports.formsRouter.use((req, res, next) => {
    if (req['group'] == 'admins') {
        next();
    }
    else {
        res.status(401).send();
    }
});
exports.formsRouter.post('/', (req, res, next) => {
    models_1.Form.create().then(_ => res.status(201).send()).catch(next);
});
exports.formsRouter.put('/:id', (req, res, next) => {
    if (req.body.revisions) {
        res.status(500).send('不能透過 PUT /forms/<id> 更新版本');
    }
    else {
        models_1.Form.findById(req.params.id, { $set: req.body }).then(_ => res.status(204).send()).catch(next);
    }
});
exports.formsRouter.delete('/:id', (req, res, next) => {
    models_1.Form.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next);
});
/** Revision 相關 **/
let revisionsRouter = express.Router();
exports.formsRouter.use('/:formID/revisions', revisionsRouter);
revisionsRouter.get('/:revision', (req, res, next) => {
    let formID = req.params.formID;
    let revision = +req.params.revision;
    models_1.Form.findById(formID).then(form => {
        let target = form.revisions.find(rev => rev.revision == revision);
        if (target) {
            res.json(target);
        }
        else {
            res.status(404).send();
        }
    }).catch(next);
});
revisionsRouter.post('/', (req, res, next) => {
    let formID = req.params.formID;
    models_1.Form.findById(formID).then(form => {
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
        }).then(_ => res.status(204).send()).catch(next);
    });
});
revisionsRouter.put('/:revision', (req, res, next) => {
    let formID = req.params.formID;
    let revision = +req.params.revision;
    models_1.Form.findOneAndUpdate({
        "_id": formID,
        "revisions": {
            "$elemMatch": {
                "revision": revision,
                "published": false
            }
        }
    }, {
        "$set": {
            "revisions.$": req.body
        }
    }).then(_ => res.status(201).send()).catch(next);
});
revisionsRouter.delete('/:revision', (req, res, next) => {
    let formID = req.params.formID;
    let revision = +req.params.revision;
    models_1.Form.findOneAndUpdate({
        "_id": formID
    }, {
        "$pull": {
            "revisions.revision": revision
        }
    }).then(_ => res.status(201).send()).catch(next);
});
//# sourceMappingURL=forms.js.map