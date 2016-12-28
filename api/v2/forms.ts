import express = require('express')

import { Group, Form, FormInterface, FormRevisionInterface, FieldInterface, Unit, User } from './../../libs/models'

export let formsRouter = express.Router()

formsRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req['group'] as Group == 'guests') {
    res.status(401).send()
  } else {
    next()
  }
})

formsRouter.get('/', async (req, res, next) => {
  /* Notes
   * There are three scopes associated with "Forms" collection,
   * *admin* and *fill*
   * One may only be using the *admin* scope, if one is an admin,
   * and requests that scope through ?scope=admin
   */

  if (req['group'] as Group == 'admins' && req.query.scope && req.query.scope == 'admin') {
    // the *admin* scope
    try {
      let forms = await Form.aggregate({
        "$project": {
          "identifier": true,
          "name": true
        }
      })
      res.json(forms)
    } catch (err) {
      next(err)
    }
  } else {
    // the *fill* scope
    let group: Group = req['group']
    try {
      let forms = await Form.aggregate([
        {
          // 取得已經發布的版本
          "$project": {
            "identifier": true,
            "name": true,
            "revisions": {
              "$filter": {
                "input": "$revisions",
                "as": "revision",
                "cond": {
                  "$and": [
                    { "$eq": ["$$revision.published", true] }
                  ]
                }
              }
            }
          }
        }, {
          // 取得已經發布的最新版本
          "$project": {
            "identifier": true,
            "name": true,
            "latestRevision": {
              "$arrayElemAt": [{ "$slice": ["$revisions", -1] }, 0]
            }
          }
        }, {
          // 看目前的這個人可不可以填寫該版本
          "$match": {
            "latestRevision.groups": group
          }
        }
      ])
      res.json(forms)
    } catch (err) {
      next(err)
    }
  }
})

formsRouter.get('/:id', async (req, res, next) => {
  let formId = req.params.id

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

  if (req['group'] as Group == 'admins' && req.query.scope && req.query.scope == 'admin') {
    // 管理員
    try {
      let form = await Form.findById(formId)
      res.json(form)
    } catch (err) {
      next(err)
    }
  } else {
    // 使用者
    let form = await Form.findById(formId)
    if (req.query.revision) {
      // 使用者需要其中一個版本
      let requestedRevisionNumber = req.query.revision
      let requestedRevision = form.revisions.find(revision => revision.number = requestedRevisionNumber)
      if (requestedRevision && requestedRevision.groups.includes(req['group'])) {
        delete form.revisions
        form['revision'] = requestedRevision
        res.json(form)
      } else {
        res.status(requestedRevision ? 401 : 404).send()
      }
    } else {
      // 找到最新的版本，檢查是否有權力
      let latestRevision = form.revisions[form.revisions.length - 1]
      if (latestRevision && latestRevision.groups.includes(req['group'])) {
        delete form.revisions
        form['revision'] = latestRevision
        res.json(form)
      } else {
        res.status(latestRevision ? 401 : 404).send()
      }
    }
  }
})

formsRouter.get('/associatedAgents', (req, res, next) => {
  let userId: string = req['user'].id
  let group: Group = req['group']

  if (group != 'vendors') {
    res.status(401).send()
    return
  }

  Unit.findOne({
    "members.vendors": userId
  }).then(unit => {
    if (!unit) {
      res.status(500).send(`不屬於任何單位`)
      return
    }

    User.find({ _id: unit.members.agents }).then(agents => {
      res.json(agents.map(a => {
        return {
          id: a.id,
          name: a.name
        }
      }))
    }).catch(next)
  }).catch(next)
})

formsRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req['group'] as Group == 'admins') {
    next()
  } else {
    res.status(401).send()
  }
})

formsRouter.post('/', (req, res, next) => {
  Form.create().then(_ => res.status(201).send()).catch(next)
})

formsRouter.put('/:id', (req, res, next) => {
  if (req.body.revisions) {
    res.status(500).send('不能透過 PUT /forms/<id> 更新版本')
  } else {
    Form.findById(req.params.id, { $set: req.body }).then(_ => res.status(204).send()).catch(next)
  }
})

formsRouter.delete('/:id', (req, res, next) => {
  Form.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next)
})

/** Revision 相關 **/
let revisionsRouter = express.Router()
formsRouter.use('/:formID/revisions', revisionsRouter);

revisionsRouter.get('/:revision', (req, res, next) => {
  let formID = req.params.formID
  let revision = +req.params.revision

  Form.findById(formID).then(form => {
    if (!form) {
      res.status(404).send()
      return
    }
    let target: FormRevisionInterface | undefined = form.revisions.find(rev => rev.number == revision)
    if (target) {
      res.json(target)
    } else {
      res.status(404).send()
    }
  }).catch(next)
})

revisionsRouter.post('/', (req, res, next) => {
  let formID = req.params.formID
  Form.findById(formID).then(form => {
    if (!form) {
      res.status(404).send()
      return
    }
    let nextRevision: Number = 1
    if (form.revisions && form.revisions.length > 0) {
      let latestRevision = form.revisions[form.revisions.length - 1]
      let revision = latestRevision.number
      nextRevision = Math.round((revision + 0.1) * 10) / 10
    }

    Form.findByIdAndUpdate(formID, {
      '$push': {
        revisions: {
          revision: nextRevision,
        }
      }
    }).then(_ => res.status(204).send()).catch(next)
  })
})

revisionsRouter.put('/:revision', (req, res, next) => {
  let formID = req.params.formID
  let revision = +req.params.revision

  Form.findOneAndUpdate({
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
    }).then(_ => res.status(201).send()).catch(next)
})

revisionsRouter.delete('/:revision', (req, res, next) => {
  let formID = req.params.formID
  let revision = +req.params.revision

  Form.findOneAndUpdate({
    "_id": formID
  }, {
      "$pull": {
        "revisions.revision": revision
      }
    }).then(_ => res.status(201).send()).catch(next)
})
