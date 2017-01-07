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

  if (req.group == 'admins' && req.query.scope && req.query.scope == 'admin') {
    try {
      let forms = await Form.find({}, {
        "identifier": true,
        "name": true
      })
      res.json(forms)
    } catch (err) {
      next(err)
    }
  } else {
    // the *fill* scope
    let group: Group = req.group
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
        }, {
          "$project": {
            "identifier": true,
            "name": true
          }
        }
      ])
      res.json(forms)
    } catch (err) {
      next(err)
    }
  }
})

formsRouter.get('/:formId', async (req, res, next) => {
  let formId = req.params.formId

  /* 備註
   * 查詢字串：
   * - scope {string} - 若使用者是管理員，則可以使用 `admin` 作為查詢值，
   *                    取得表單中所有資訊
   * - revisionNumber {number} - 可以用來取得特定版本，範例：
   *                             `revisionNumber=1.2`
   */

  try {
    let form = await Form.findById(formId).exec()
    // 找不到該表單
    if (!form) {
      res.status(404).send(`找不到 ID 為 ${formId} 的表單`)
      return
    }

    // 管理員
    if (req.query.scope == 'admin') {
      res.json(form)
      return
    }

    let revision: FormRevisionInterface = null

    // 回傳單一版本的狀況
    if (req.query.revisionNumber) {
      // 查詢特定版本 - 使用 `revisionNumber`
      let number = Number.parseFloat(req.query.revisionNumber)
      if (Number.isNaN(number)) {
        res.status(500).send(`無法將 ${req.query.revisionNumber} 解析為數字。`)
        return
      }
      revision = form.revisions.filter(rev => rev.number == number)[0]
      if (!revision) {
        res.status(404).send(`找不到版本號為 ${number} 的版本`)
        return
      }
      if (!revision.published) {
        res.status(401).send(`版本尚未發布`)
        return
      }
    } else {
      // 預設值 - 使用最新版本
      revision = form.revisions.filter(rev => rev.published).slice(-1)[0]
      if (!revision) {
        res.status(404).send(`找不到可用的表單版本`)
        return
      }
    }

    if (!revision.groups.includes(req.group)) {
      res.status(401).send(`您沒有查看該表單的權利`)
      return
    }
    let response = form as any
    delete response.revisions
    response.revision = revision
    res.json(response)
  } catch (err) {
    next(err)
    return
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
      res.json(agents.map(agent => {
        return {
          id: agent.id,
          name: agent.name
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
formsRouter.use('/:formId/revisions', revisionsRouter);

revisionsRouter.post('/', (req, res, next) => {
  let formId = req.params.formId
  Form.findById(formId).then(form => {
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

    Form.findByIdAndUpdate(formId, {
      '$push': {
        revisions: {
          revision: nextRevision,
        }
      }
    }).then(_ => res.status(204).send()).catch(next)
  })
})

revisionsRouter.put('/:revisionId', async (req, res, next) => {
  let formId = req.params.formId
  let revisionId = req.params.revisionId

  let targetForm: FormInterface = null
  try {
    targetForm = await Form.findById(formId)
    if (!targetForm) {
      res.status(404).send()
      return
    }
  } catch (err) {
    next(err)
    return
  }

  let targetRevision = targetForm.revisions.find(rev => rev.id == revisionId)
  if (!targetRevision) {
    res.status(404).send()
    return
  }

  if (req.body.number) {
    // 版本號可能有更動
    let revisionsWithSameNumber = targetForm.revisions.filter(rev => rev.number == req.body.number)
    if (revisionsWithSameNumber.length >= 2) {
      res.status(500).send()
      return
    } else if (revisionsWithSameNumber.length == 1 && !(revisionsWithSameNumber[0].id == revisionId)) {
      res.status(500).send()
      return
    }
  }

  if (targetRevision.published) {
    res.status(500).send()
    return
  }

  Form.findOneAndUpdate({
    "_id": formId,
    "revisions": {
      "$elemMatch": {
        "_id": revisionId,
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
  let formId = req.params.formId
  let revision = +req.params.revision

  Form.findOneAndUpdate({
    "_id": formId
  }, {
      "$pull": {
        "revisions.revision": revision
      }
    }).then(_ => res.status(201).send()).catch(next)
})
