'use strict'

import express = require('express')
import auth    = require('./../util/auth')

import {Unit, Form, Record, RecordInterface} from './../libs/models'

// 型態別稱
type Request  = express.Request
type Response = express.Response
type Next     = express.NextFunction

var  router   = express.Router()

function signatureList(unitID: string, signatures: boolean, officer: boolean): Promise<string[]> {
  if (!signatures) {
    // 不需要簽核
    return Promise.resolve([])
  } else {
    return new Promise<string[]>((resolve, reject) => {
      Unit.findById(unitID).exec().then(unit => {
        // 檢察單位是否有主管（若需要的話）
        if (officer && !unit.manager) {
          reject(new Error('單位沒有主管，無法建立紀錄。'))
        } else {
          // 若有母單位，繼續搜尋
          if (unit.parentUnit) {
            signatureList(unit.parentUnit, true, true).then(nexts => {
              if (officer) {
                resolve([unit.manager, ...nexts])
              } else {
                resolve(nexts)
              }
            }).catch(reject)
          } else {
            if (officer) {
              resolve([unit.manager])
            } else {
              resolve([])
            }
          }
        }
      })
    })
  }
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

// 取得某一個表單的表單形狀
router.get('/:formID/schema', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const formID = req.params.formID
  
  // 驗證使用者是否有資格填寫該表單
  auth.return_user(token).then(user => {
    // 取得使用者資料
    // 現在只看使用者是否有足夠權限（群組資格）
    
    const userGroup = user.group
    Form.findById(formID).exec().then(form => {
      const latestFormRevision = form.revisions[form.revisions.length - 1]
      const formGroup = latestFormRevision.group
      
      if (userGroup <= formGroup) {
        // 使用者有足夠權限！
        
        res.json(latestFormRevision.fields)
      } else {
        next(new Error("權限不足。"))
      }
    }).catch(next)
  })
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
        
        let officerSignature = form.revisions[form.revisions.length - 1].officerSignature
        let signatures = form.revisions[form.revisions.length - 1].signatures
        let revisionID = form.revisions[form.revisions.length - 1].id
        
        Record.find({owningUnit: unitID}).sort({serial: 'ascending'})
              .select('serial').limit(1).exec().then(records => {
          let serial: number = 1
          if (records.length == 1) {
            serial = records[0].serial + 1
          }
          
          signatureList(unitID, signatures, officerSignature).then(chain => {
            // 把自己加進簽核鍊之中！
            let signaturesChain = [userID, ...chain]
            let signaturesArray = signaturesChain.map(element => {return {
              personnel: element,
              timestamp: new Date(),
              signed: false
            }})
            
            // 自己送出表單時，視同進行簽名
            signaturesArray[0].signed = true;
            
            // 表單資料
            const formData = JSON.parse(req.body.data)
            
            Record.create({
              formID: formID,
              formRevision: revisionID,
              owningUnit: unitID,
              serial: serial,
              owner: userID,
              signatures: signaturesArray,
              data: formData
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