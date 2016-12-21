import express = require('express')
import { UserInterface } from './../../libs/models'
import { Group } from './../../libs/models'
import { Record } from './../../libs/models'
import { Unit, UnitInterface } from './../../libs/models'
import { Form } from './../../libs/models'

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
      let chain = [userId]

      // 找出那個人在哪裡（這個人一定是承辦人）
      let userUnit = units.find(u => u.members.agents.includes(userId))
      let current = userUnit
      while (current != undefined) {
        if (current.members.manager) {
          chain.push(current.members.manager)
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
  if (req['group'] as Group == 'guests') {
    res.status(401).send()
  } else {
    next()
  }
})
recordsRouter.get('/', (req, res, next) => {
  let userID = (req['user'] as UserInterface).id

  if (req['group'] as Group == 'admins' && req.query.scope && req.query.scope == 'admin') {
    Record.find({}, { contents: 0 }).then(forms => res.json(forms)).catch(next)
  } else {
    let predicates: { [_: string]: any }[] = [
      { "signatures.personnel": userID }
    ]
    // 找出該使用者的角色
    Unit.find({
      "$or": [
        { "members.docsControl": userID },
        { "members.manager": userID }
      ]
    }).then(userUnit => {
      if (userUnit.length > 0) {
        // 主管或是文管
        let unit = userUnit[0]
        getAllChildren(unit.id).then(childrenIDs => {
          predicates.push({
            "owningUnit": childrenIDs
          })

          Record.find({ "$or": predicates }, { contents: false }).then(records => res.json(records)).catch(next)
        }).catch(next)
      } else {
        // 無單位歸屬或者是有單位但是不是主管或是文管
        Record.find({
          "signatures.personnel": userID
        }, {
            contents: 0
          }).then(records => res.json(records)).catch(next)
      }
    })
  }
})
recordsRouter.get('/:id', (req, res, next) => {
  let userID = (<UserInterface>req['user']).id

  // 先取得該資料
  let recordId = req.params.id

  Record.findById(recordId).then(record => {
    if (!record) {
      res.status(404).send()
      return
    }
    if (req['group'] as Group == 'admins' && req.query.scope && req.query.scope == 'admin') {
      // 管理員
      res.json(record)
    } else {
      Unit.find({
        "$or": [
          { "members.docsControl": userID },
          { "members.manager": userID }
        ]
      }).then(userUnit => {
        if (userUnit.length > 0) {
          // 是文管或是主管
          getAllChildren(userUnit[0].id).then(childrenIDs => {
            if (childrenIDs.includes(record.owningUnit)) {
              res.json(record)
            } else {
              res.status(401).send()
            }
          }).catch(next)
        } else {
          // 正常權限
          if (record.signatures.findIndex(sig => sig.personnel == userID) >= 0) {
            // 使用者在簽核鏈中
            res.json(record)
          } else {
            res.status(401).send()
          }
        }
      }).catch(next)
    }
  }).catch(next)
})
recordsRouter.post('/', (req, res, next) => {
  let userId: string = req['user'].id
  let formId: string = req.body.formId
  let contents = <{ [fieldId: string]: any }>req.body.contents

  Form.findById(formId).then(form => {
    if (!form) {
      res.status(500).send(`表單不存在`)
      return
    }
    let latestRevision = form.revisions.slice(-1)[0]
    // 1. 看得到那一個表單
    // 2. 是承辦人或是廠商
    // 3. 有單位歸屬

    // 判斷 (1)
    if (!latestRevision.group[<Group>req['group']]) {
      res.status(401).send()
      return
    }

    // 判斷 (2)(3)
    Unit.find({
      "$or": [
        { "$members.agents": userId },
        { "$members.vendors": userId }
      ]
    }).then(units => {
      if (units.length <= 0) {
        res.status(401).send()
        return
      }

      // 檢查是否有遺漏的欄位
      for (let field of latestRevision.fields) {
        let fieldId = field.id
        if (contents[fieldId] == undefined) {
          res.status(500).send()
          return
        }
      }

      // 找到下一個編號
      let thisYear = (new Date()).getFullYear()
      Record.find({
        "created": {
          "$gte": new Date(thisYear, 0, 1, 0, 0, 0),
          "$lte": new Date(thisYear, 11, 31, 23, 59, 59)
        }
      }).sort({ serial: -1 }).limit(1).then(records => {
        let nextSerial = 0
        if (records.length >= 0) {
          nextSerial = records[0].serial + 1;
        }

        // 建立簽核鏈
        let target = userId
        let chain = []

        if (<Group>req['group'] == 'vendors') {
          // 廠商
          let associatedAgent: string | undefined = req.body.associatedAgent
          if (!associatedAgent) {
            res.status(500).send(`廠商必須指定相關承辦人。`)
            return
          } else if (!units[0].members.agents.includes(associatedAgent)) {
            res.status(500).send(`廠商所指定得相關承辦人必須位於同一個單位。`)
            return
          }
          chain.push(userId)
          target = associatedAgent
        }

        getResponsibilityChain(target).then(laterPartOfChain => {
          chain.push(laterPartOfChain)
          let signatures = chain.map(p => {
            return {
              personnel: p,
              timestamp: new Date(),
              signed: false
            }
          })
          signatures[0].signed = true

          // 建立文件
          let record = new Record({
            formID: formId,
            formRevision: latestRevision.id,
            owningUnit: units[0].id,
            created: new Date(),
            serial: nextSerial,
            generatedSerial: `${thisYear - 1911}-${units[0].identifier}-${nextSerial}`,
            owner: userId,
            signatures: signatures,
            contents: contents
          })

          record.save().then(_ => res.status(201).send()).catch(next)
        }).catch(next)
      }).catch(next)
    }).catch(next)
  }).catch(next)
})
recordsRouter.post('/:id/actions/sign', (req, res, next) => {
  let userId = (<UserInterface>req['user']).id
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

    record.markModified('signatures')
    record.save().then(_ => res.status(201).send()).catch(next)
  }).catch(next)
})
recordsRouter.post('/:id/actions/return', (req, res, next) => {
  let userId = (<UserInterface>req['user']).id
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

    record.markModified('signatures')
    record.save().then(_ => res.status(201).send()).catch(next)
  }).catch(next)
})
recordsRouter.put('/:id', (req, res, next) => {
  let group: Group = req['group']
  let recordId = req.params.id

  if (group != 'admins') {
    res.status(401).send()
  }

  Record.findByIdAndUpdate(recordId, {
    "$set": req.body
  }).then(_ => res.status(204).send()).catch(next)
})


// TODO: 更改 Forms 如果廠商要求表單，再給他單位內的人事

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


