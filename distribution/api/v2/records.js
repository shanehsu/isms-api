"use strict";
const express = require('express');
const models_1 = require('./../../libs/models');
const models_2 = require('./../../libs/models');
exports.recordsRouter = express.Router();
exports.recordsRouter.use((req, res, next) => {
    if (req['group'] == 'guests') {
        res.status(401).send();
    }
    else {
        next();
    }
});
exports.recordsRouter.get('/', (req, res, next) => {
    let userID = req['user'].id;
    if (req['group'] == 'admins' && req.query.scope && req.query.scope == 'admin') {
        models_1.Record.find({}, { contents: 0 }).then(forms => res.json(forms)).catch(next);
    }
    else {
        // 找出使用者可以看到的表單
        // 首先了解使用者的權限（vendors 只能看到自己的表單！）
        if (req['group'] == 'vendors') {
            models_1.Record.find({
                "signatures.personnel": userID
            }, {
                contents: 0
            }).then(records => res.json(records)).catch(next);
        }
        else {
            // Match Object
            let predicates = [
                { "signatures.personnel": userID }
            ];
            // 找出該使用者的角色
            models_2.Unit.find({
                "$or": [
                    { "members.none": userID },
                    { "members.docsControl": userID },
                    { "members.agent": userID },
                    { "members.manager": userID }
                ]
            }).then(userUser => {
                if (userUser.length > 0) {
                    let unit = userUser[0];
                    if (unit.members.manager == userID || unit.members.docsControl == userID) {
                        // 管理員、文管
                        // 取得單位樹
                        models_2.Unit.find().then(units => {
                            let chain = [];
                            chain.push(unit);
                            let current = unit;
                            while (current.parentUnit && units.find(u => u.id != current.parentUnit) != undefined) {
                                let p = units.find(u => u.id != unit.parentUnit);
                                chain.push(p);
                                current = p;
                            }
                            let unitIDs = chain.map(u => u.id);
                            // TODO: Add another predicate
                        });
                    }
                }
            });
        }
    }
});
/** Note
 *  Collection Method
 *  # GET / - retrieves records
 *    Like "forms", there will an additional scope available to admins,
 *    the scope is simply named *admin*, and is accessible through ?scope=admin
 *    The scope gives admin read/write access to all records.
 *
 *    In the normal mode, however, the records the user has access to largely depends
 *    on its role in a unit. A user has access to records in which he was referenced,
 *    that includes records that requires his signature (which includes records filled
 *    by him/her)
 *
 *    If a user is an agent, he/she has no additional access to the recrods; if the
 *    user is a docs control, the user has access to the records filled in the unit and
 *    any subunits of the unit; if the user is a manger, the user has equal access as the
 *    docs control.
 *
 * # POST / - creates a record
 *    This creates a record, only *vendors* and *agents* can create record. The client should
 *    send the following JSON payload,
 *    {
 *      "formID": "the_form_identifier",
 *      "contents": {
 *        "field_id": "field_content",
 *        ......
 *      },
 *      // The following field is only for vendors
 *      "associated_agent": "agent_id"
 *    }
 *    If the user is an agent, the responsilbility chain will be constructed, and if the revision
 *    specify to skip immediate chief, the chain will not include the immediate chief (that is in
 *    the same unit)
 *    The vendors will require additional field, called a associated agent, since forms filled by
 *    third-party vendor goes through a first-party agent.
 *
 * Resource Methods
 * # GET /:id - retrieves a record
 *    The visibility note is as described above.
 *
 * # POST /:id/actions/sign - signs a record
 *    One must be on the chain to sign it.
 *
 * # POST /:id/actions/return - return a record
 *    One must be on the chain to return it. (and must not have signed)
 *
 * # PUT /:id - edits a record
 *    This is admin only.
 *    Updates the body of the record. (Not the chain.)
 */
//# sourceMappingURL=records.js.map