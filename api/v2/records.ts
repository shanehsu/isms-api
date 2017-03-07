import express = require('express')
import { UserInterface } from './../../libs/models'
import { Group } from './../../libs/models'
import { Record, RecordInterface } from './../../libs/models'
import { Unit, UnitInterface } from './../../libs/models'
import { Form, FormInterface } from './../../libs/models'
var ObjectId = require('mongoose').Types.ObjectId

export let recordsRouter = express.Router()

function getAllChildren(unitId: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Unit.find().then(units => {
      let chain: string[] = []
      let current = units.find(u => u.id == unitId)
      while (current != undefined) {
        chain.push(current.id)
        current = units.find(u => u.parentUnit == current.id)
      }
      resolve(chain)
    }).catch(reject)
  })
}
function getResponsibilityChain(userId: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    Unit.find({}).then(units => {
      let chain = []

      // 找出那個人在哪裡（這個人一定是承辦人）
      let userUnit = units.find(u => u.members.agents.map(a => a.toString()).includes(userId))
      let current = userUnit
      while (current != undefined) {
        if (current.members.manager) {
          chain.push(current.members.manager.toString())
        } else {
          reject(new Error(`「${current.name}」沒有設定主管`))
          return
        }
        if (current.parentUnit) {
          current = units.find(u => u.id == current.parentUnit)
        } else {
          break
        }
      }
      resolve(chain)
    }).catch(reject)
  })
}
recordsRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req.group == 'guests') {
    res.status(401).send()
  } else {
    next()
  }
})
recordsRouter.get('/', async (req, res, next) => {
  let aggregationPipeline = [
    {
      $project: {
        contents: 0
      }
    },
    {
      $unwind: {
        path: "$signatures",
        preserveNullAndEmptyArrays: false // Will Never Happen Anyways
      }
    }, {
      $lookup: {
        "from": "users",
        "localField": "signatures.personnel",
        "foreignField": "_id",
        "as": "signatures.source"
      }
    }, {
      $addFields: {
        "signatures.name": {
          "$cond": {
            "if": { "$ne": ["$signatures.as", ""] },
            "then": "$signatures.as",
            "else": { "$arrayElemAt": ["$signatures.source.name", 0] }
          }
        }
      }
    }, {
      $project: {
        "signatures.source": 0,
        "signatures.as": 0
      }
    }, {
      $group: {
        "_id": "$_id",
        "formId": { "$first": "$formId" },
        "formRevision": { "$first": "$formRevision" },
        "owningUnit": { "$first": "$owningUnit" },
        "generatedSerial": { "$first": "$generatedSerial" },
        "owner": { "$first": "$owner" },
        "status": { "$first": "$status" },
        "signatures": { "$push": "$signatures" },
        "created": { "$first": "$created" }
      }
    }, {
      $lookup: {
        "from": "users",
        "localField": "owner",
        "foreignField": "_id",
        "as": "_owner"
      }
    }, {
      $lookup: {
        "from": "forms",
        "localField": "formId",
        "foreignField": "_id",
        "as": "_form"
      }
    }, {
      $lookup: {
        "from": "units",
        "localField": "owningUnit",
        "foreignField": "_id",
        "as": "_unit"
      }
    }, {
      $unwind: {
        "path": "$_form",
        "preserveNullAndEmptyArrays": false
      }
    }, {
      $unwind: {
        "path": "$_form.revisions",
        "preserveNullAndEmptyArrays": false
      }
    }, {
      $addFields: {
        "rightOne": { "$eq": ["$_form.revisions._id", "$formRevision"] }
      }
    }, {
      $match: {
        "rightOne": true
      }
    }, {
      $addFields: {
        "formName": "$_form.name",
        "revisionNumber": "$_form.revisions.number",
        "ownerName": { "$arrayElemAt": ["$_owner.name", 0] },
        "unitName": { "$arrayElemAt": ["$_unit.name", 0] },
      }
    }, {
      $project: {
        "_owner": 0,
        "_form": 0,
        "_unit": 0,
        "rightOne": 0
      }
    }
  ]

  let userId = req.user.id

  if (req.group == 'admins' && req.query.scope && req.query.scope == 'admin') {
    try {
      let records = await Record.aggregate(aggregationPipeline)
      res.json(records)
    } catch (err) {
      next(err)
    }

    return
  }

  let predicates: { [_: string]: any }[] = [
    { "signatures.personnel": new ObjectId(userId) }
  ]

  // 找出該使用者的角色
  try {
    let belongingUnit = await Unit.find({
      "$or": [
        { "members.docsControl": userId },
        { "members.manager": userId }
      ]
    })

    if (belongingUnit.length > 0) {
      // 主管或是文管
      let unit = belongingUnit[0]
      let children = await getAllChildren(unit.id)
      predicates.push({
        "owningUnit": {
          "$in": children.map(c => new ObjectId(c))
        }
      })
    }
    let records = await Record.aggregate([{ "$match": { "$or": predicates } }, ...aggregationPipeline])

    res.json(records)
  } catch (err) {
    next(err)
  }
})
recordsRouter.get('/:id', async (req, res, next) => {
  let aggregationPipeline = [
    {
      $unwind: {
        path: "$signatures",
        preserveNullAndEmptyArrays: false // Will Never Happen Anyways
      }
    }, {
      $lookup: {
        "from": "users",
        "localField": "signatures.personnel",
        "foreignField": "_id",
        "as": "signatures.source"
      }
    }, {
      $addFields: {
        "signatures.name": {
          "$cond": {
            "if": { "$ne": ["$signatures.as", ""] },
            "then": "$signatures.as",
            "else": { "$arrayElemAt": ["$signatures.source.name", 0] }
          }
        }
      }
    }, {
      $project: {
        "signatures.source": 0,
        "signatures.as": 0
      }
    }, {
      $group: {
        "_id": "$_id",
        "formId": { "$first": "$formId" },
        "formRevision": { "$first": "$formRevision" },
        "owningUnit": { "$first": "$owningUnit" },
        "generatedSerial": { "$first": "$generatedSerial" },
        "owner": { "$first": "$owner" },
        "status": { "$first": "$status" },
        "signatures": { "$push": "$signatures" },
        "contents": { "$first": "$contents" },
        "created": { "$first": "$created" }
      }
    }, {
      $lookup: {
        "from": "users",
        "localField": "owner",
        "foreignField": "_id",
        "as": "_owner"
      }
    }, {
      $lookup: {
        "from": "forms",
        "localField": "formId",
        "foreignField": "_id",
        "as": "_form"
      }
    }, {
      $lookup: {
        "from": "units",
        "localField": "owningUnit",
        "foreignField": "_id",
        "as": "_unit"
      }
    }, {
      $unwind: {
        "path": "$_form",
        "preserveNullAndEmptyArrays": false
      }
    }, {
      $unwind: {
        "path": "$_form.revisions",
        "preserveNullAndEmptyArrays": false
      }
    }, {
      $addFields: {
        "rightOne": { "$eq": ["$_form.revisions._id", "$formRevision"] }
      }
    }, {
      $match: {
        "rightOne": true
      }
    }, {
      $addFields: {
        "formName": "$_form.name",
        "revisionNumber": "$_form.revisions.number",
        "ownerName": { "$arrayElemAt": ["$_owner.name", 0] },
        "unitName": { "$arrayElemAt": ["$_unit.name", 0] },
      }
    }, {
      $project: {
        "_owner": 0,
        "_form": 0,
        "_unit": 0,
        "rightOne": 0
      }
    }
  ]

  let userId = req.user.id

  let recordId = req.params.id
  try {
    let records = await Record.aggregate([
      {
        "$match": {
          "_id": new ObjectId(recordId)
        }
      }, ...aggregationPipeline
    ])
    let record = records[0] as RecordInterface
    if (!record) {
      res.status(404).send()
      return
    }

    if (req.group == 'admins' && req.query.scope && req.query.scope == 'admin') {
      // 管理員
      res.json(record)
    } else {
      let units = await Unit.find({
        "$or": [
          { "members.docsControl": new ObjectId(userId) },
          { "members.manager": new ObjectId(userId) }
        ]
      })
      if (units.length > 0) {
        let unit = units[0]

        // 是文管或是主管
        let childrenIds = await getAllChildren(unit.id)
        childrenIds.push(unit.id)
        childrenIds = childrenIds.map(id => id.toString())

        if (childrenIds.includes(record.owningUnit.toString())) {
          res.json(record)
        } else {
          res.status(401).send()
        }
      } else {
        // 正常權限
        if (record.signatures.findIndex(sig => sig.personnel.toString() == userId) >= 0) {
          // 使用者在簽核鏈中
          res.json(record)
        } else {
          res.status(401).send()
        }
      }
    }
  } catch (err) {
    next(err)
  }
})
recordsRouter.post('/', async (req, res, next) => {
  let userId: string = req.user.id
  let formId: string = req.body.formId
  let contents = <{ [fieldId: string]: any }>req.body.contents

  let form: FormInterface = null
  try {
    form = await Form.findById(formId)
  } catch (err) {
    next(err)
    return
  }

  if (!form) {
    next(`表單不存在`)
  }

  let latestRevision = form.revisions.filter(v => v.published).slice(-1)[0]
  // 1. 看得到那一個表單
  // 2. 是承辦人或是廠商
  // 3. 有單位歸屬

  // 判斷 (1)
  if (!latestRevision.groups.includes(req.group)) {
    res.status(401).send()
    return
  }

  // 判斷 (2)(3)
  let unit: UnitInterface = null
  try {
    let units = await Unit.find({
      "$or": [
        { "members.agents": userId },
        { "members.vendors": userId }
      ]
    })

    if (units.length <= 0) {
      throw new Error(`找不到使用者的單位`)
    }

    unit = units[0]
  } catch (err) {
    next(err)
    return
  }

  // 檢查是否有遺漏的欄位
  for (let field of latestRevision.fields) {
    let fieldId = field.id
    if (contents[fieldId] == undefined) {
      res.status(500).send(`遺失的表單欄位`)
      return
    }
  }

  // 找到下一個編號
  let currentYear = (new Date()).getFullYear()

  let lastRecord: RecordInterface

  try {
    let lasts = await Record.find({
      "created": {
        "$gte": new Date(currentYear, 0, 1, 0, 0, 0),
        "$lte": new Date(currentYear, 11, 31, 23, 59, 59)
      },
      "owningUnit": unit.id
    }).sort({ serial: -1 }).limit(1)
    lastRecord = lasts[0]
  } catch (err) {
    next(err)
    return
  }

  let nextSerial = 1
  if (lastRecord) {
    nextSerial = lastRecord.serial + 1
  }

  // 建立簽核鏈
  let target = userId
  let chain = []

  if (req.group == 'vendors') {
    // 廠商
    let associatedAgent: string | undefined = req.body.associatedAgent

    if (!associatedAgent) {
      res.status(500).send(`廠商必須指定相關承辦人。`)
      return
    } else if (!unit.members.agents.map(a => a.toString()).includes(associatedAgent)) {
      res.status(500).send(`廠商所指定得相關承辦人必須位於同一個單位。`)
      return
    }
    chain.push(userId)
    target = associatedAgent
  }
  chain.push(target)

  // 需要簽核
  if (latestRevision.signatures) {
    let laterPartOfChain: string[] = []
    try {
      laterPartOfChain = await getResponsibilityChain(target)
    } catch (err) {
      next(err)
      return
    }
    if (latestRevision.skipImmediateChief) {
      laterPartOfChain.splice(0, 1)
    }

    chain.push(...laterPartOfChain)
  }

  let signatures = chain.map(p => {
    return {
      personnel: p,
      timestamp: new Date(),
      signed: false,
      as: ''
    }
  })

  signatures[0].signed = true
  signatures[0].as = req.body.signature

  let noSignaturesRequired = signatures.reduce((prev, signature) => { return signature.signed && prev }, true)

  // 建立文件
  let record = new Record({
    formId: formId,
    formRevision: latestRevision.id,
    owningUnit: unit.id,
    created: new Date(),
    serial: nextSerial,
    generatedSerial: `${currentYear - 1911}-${unit.identifier}-${nextSerial}`,
    owner: userId,
    signatures: signatures,
    contents: contents,
    status: noSignaturesRequired ? 'accepted' : 'awaiting_review'
  })

  try {
    console.dir(record)
    let savedRecord = await record.save()
    console.dir(savedRecord)
    res.status(201).send(savedRecord.id)
  } catch (err) {
    next(err)
    return
  }
})
recordsRouter.post('/:id/actions/sign', (req, res, next) => {
  let userId = req.user.id
  // 先取得該資料
  let recordId = req.params.id

  Record.findById(recordId).then(record => {
    if (!record) {
      res.status(404).send()
      return
    }
    let itsSignature = record.signatures.find(q => q.personnel == userId)
    if (itsSignature.signed) {
      let ts = itsSignature.timestamp
      res.status(500).send(`你已經於 ${ts.getFullYear()} 年 ${ts.getMonth() + 1} 月 ${ts.getDate()} 日 ${ts.getHours()} 時 ${ts.getMinutes()} 分時簽署這份文件。`)
      return
    }

    itsSignature.signed = true
    itsSignature.timestamp = new Date()
    itsSignature.as = req.body.as

    if (record.signatures.indexOf(itsSignature) == record.signatures.length - 1) {
      record.status = 'accepted'
      record.markModified('status')
    }

    record.markModified('signatures')
    record.save().then(_ => res.status(201).send()).catch(next)
  }).catch(next)
})
recordsRouter.post('/:id/actions/decline', (req, res, next) => {
  let userId = req.user.id
  // 先取得該資料
  let recordId = req.params.id

  Record.findById(recordId).then(record => {
    if (!record) {
      res.status(404).send()
      return
    }
    let itsSignature = record.signatures.find(q => q.personnel == userId)
    if (itsSignature.signed) {
      let ts = itsSignature.timestamp
      res.status(500).send(`你已經於 ${ts.getFullYear()} 年 ${ts.getMonth() + 1} 月 ${ts.getDate()} 日 ${ts.getHours()} 時 ${ts.getMinutes()} 分時簽署這份文件。`)
      return
    }

    for (let signature of record.signatures) {
      signature.signed = false
    }

    record.status = 'declined'

    record.markModified('signatures')
    record.markModified('status')

    record.save().then(_ => res.status(201).send()).catch(next)
  }).catch(next)
})
recordsRouter.put('/:id', async (req, res, next) => {
  let group: Group = req.group
  // 若該 Id 的狀態為 'declined' 則可以編輯

  // 管理員編輯
  if (req.query.scope == 'admin') {
    next()
    return
  }

  // 非管理人員，必須是本人才可以編輯
  let recordId = req.params.id
  try {
    await Record.findOneAndUpdate({
      "_id": recordId,
      "owner": req.user.id,
      "status": "declined"
    }, {
        "$set": {
          "contents": req.body
        }
      })
  } catch (err) {
    res.status(500).send()
    return
  }

  res.status(204).send()
})
recordsRouter.put('/:id', (req, res, next) => {
  let group: Group = req.group
  let recordId = req.params.id

  if (group != 'admins') {
    res.status(401).send()
  }
  try {
    Record.findByIdAndUpdate(recordId, {
      "$set": req.body
    }).then(_ => res.status(204).send()).catch(next)
  } catch (err) {
    res.status(500).send()
    return
  }
  res.status(204).send()
})


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
 *      "formId": "TheFormIdentifier",
 *      "contents": {
 *        "fieldId": "FieldContent",
 *        ......
 *      },
 *      // The following field is only for vendors
 *      "associatedAgent": "agent_id"
 *    }
 *    If the user is an agent, the responsilbility chain will be constructed, and if the revision
 *    specify to skip immediate chief, the chain will not include the immediate chief (that is in
 *    the same unit)
 *    The vendors will require additional field, called a associated agent, since forms filled by
 *    third-party vendor goes through a first-party agent.
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
 *    The payload itself is the contents.
 *   [
 *      "fieldId": "FieldContent",
 *      "......": "......"
 *   ]
 */


