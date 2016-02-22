'use strict'

import express = require('express')
import auth    = require('./../util/auth')

import {Unit, Form, Record, RecordInterface} from './../libs/models'

// 型態別稱
type Request  = express.Request
type Response = express.Response
type Next     = express.NextFunction

var  router   = express.Router()

function signatureList(unitID: string, signatures: number): Promise<string[]> {
  if (signatures < 1) {
    return Promise.resolve([])
  }
  return new Promise<string[]>((resolve, reject) => {
    Unit.findById(unitID).exec().then(unit => {
      if (!unit.manager) {
        reject(new Error('簽核鏈中有單位沒有主管，無法建立記錄。'))
      } else {
        let thisManager = unit.manager
        if (signatures == 1) {
          resolve([thisManager])
        } else {
          if (!unit.parentUnit) {
            reject(new Error('簽核鏈中有單位沒有母單位，無法建立記錄。'))
          } else {
            signatureList(unit.parentUnit, signatures - 1).then(nextManagers => {
              resolve([thisManager, ...nextManagers])
            }).catch(reject)
          }
        }
      }
    }).catch(reject)
  })
}

function allChildUnits(unitID: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    Unit.findById(unitID).exec().then(unit => {
      if (!unit.childUnits || unit.childUnits.length == 0) {
        resolve([])
      } else {
        let children = unit.childUnits
        let grandChildren = []
        let recursiveFunction = function(index: number): void {
          if (index == children.length) {
            resolve([...children, ...grandChildren])
          } else {
            allChildUnits(children[index]).then(itsChild => {
              grandChildren.push(itsChild)
              index ++
              recursiveFunction(index)
            }).catch(reject)
          }
        }
        recursiveFunction(0)
      }
    })
  })
}

router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
  auth.return_user(token).then(user => {
    const userID = user.id
    
    // 先看是不是文管人員或是主管
    if (user.unit) {
      Unit.findById(user.unit).exec().then(unit => {
        if (unit.docsControl == userID || unit.manager == userID) {
          allChildUnits(user.unit).then(units => {
            let unitIDs = units
            Record.find({
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
            }).sort({ created: 'descending' }).exec()
              .then(docs => res.json(docs))
              .catch(next)
          }).catch(() => next(new Error('無法取得所有子單位的 ID。')))
        } else {
          // 自己的表單
          Record.find({ owner: userID }).sort({ created: 'descending' }).exec()
                .then(docs => res.json(docs))
                .catch(next)
        }
      })
    } else {
      // 自己的表單
      Record.find({owner: userID}).sort({created: 'descending'}).exec()
            .then(docs => res.json(docs))
            .catch(next)
    }
  }).catch(next) 
})

router.post('/:formID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const formID: string = req.params.formID
  
  auth.return_user(token).then(user => {
    const userID = user.id
    const unitID = user.unit
    
    Unit.findById(unitID).exec().then(unit => {
      if (unit.agents.indexOf(userID) == -1) {
        next(new Error('不是承辦人無法填寫表單。'))
        return
      }
      
      Form.findById(formID).exec().then(form => {
        if (!form.revisions || form.revisions.length == 0) {
          next(new Error('表單沒有可填寫的表單版本。'))
          return
        }
        
        let signatures = form.revisions[form.revisions.length - 1].signatures
        let revisionID = form.revisions[form.revisions.length - 1].id
        
        Record.find({owningUnit: unitID}).sort({serial: 'ascending'})
              .select('serial').limit(1).exec().then(records => {
          let serial: number = 1
          if (records.length == 1) {
            serial = records[0].serial + 1
          }
          
          signatureList(unitID, signatures).then(chain => {
            let signaturesChain = chain
            let signaturesArray = signaturesChain.map(element => {return {
              personnel: element,
              signed: false
            }})
            
            Record.create({
              formID: formID,
              formRevision: revisionID,
              owningUnit: unitID,
              serial: serial,
              owner: userID,
              signatures: signaturesArray
            }).then(record => res.send(record.id)).catch(next)
          }).catch(next)
        }).catch(next)
      }).catch(next)
    }).catch(next)
  }).catch(next) 
})

router.put('/:recordID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const recordID: string = req.params.recordID
  
  auth.return_user(token).then(user => {
    let userID = user.id
    
    Record.findById(recordID).exec().then(record => {
      if (record.owner != userID) {
        next(new Error('只有建檔人可以填寫表單記錄。'))
        return
      }
      
      try {
        record.data = req.body
      } catch (e) {
        next(new Error('無法儲存表單記錄'))
      }
      
      record.save(err => {
        if (err) {
          next(err)
        } else {
          res.sendStatus(200)
        }
      })
    }).catch(next)
  }).catch(next)
})

// 增加管理員、文管人員、單位主管可以刪除表單的功能！
router.delete('/:recordID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const recordID: string = req.params.recordID
  
  auth.ensure_group(token, 1).then(() => {
    // 以管理員的身份
    Record.findByIdAndRemove(recordID).exec()
          .then(() => res.sendStatus(200)).catch(next)
  }).catch(() => {
    auth.return_user(token).then(user => {
      let userID = user.id
      Record.findById(recordID).exec().then(record => {
        if (record.owner == userID) {
          // 以建檔人的身份
          Record.findByIdAndRemove(recordID).exec()
                .then(() => res.sendStatus(200)).catch(next)
        } else {
          // 以單位主管、文管的身份
          let thisUnit = record.owningUnit
          
          let recursiveFunction = function(unit: string): void {
            Unit.findById(unit).exec().then(unit => {
              if (unit.docsControl == userID || unit.manager == userID) {
                Record.findByIdAndRemove(recordID).exec()
                      .then(() => res.sendStatus(200)).catch(next)
              } else {
                if (unit.parentUnit) {
                  return recursiveFunction(unit.parentUnit)
                } else {
                  next(new Error('你並非管理員、建檔人、或是單位主管或文管人員。'))
                }
              }
            }).catch(next)
          }
          
          recursiveFunction(thisUnit)
        }
      }).catch(next)
    }).catch(next)
  })
})

module.exports = router