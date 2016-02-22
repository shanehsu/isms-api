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
  
}

router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
  auth.return_user(token).then(user => {
    const userID = user.id
    if (req.query.scope == undefined) {
      Record.find({owner: userID}).sort({created: 'descending'}).exec()
            .then(docs => res.json(docs))
            .catch(next)
    } else if (req.query.scope == 'unit') {
      // 要是單位主管或是單位文管人員
      // 顯示該單位以及及直屬單位的所有表單
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
          
          
        }).catch(next)
      })
    }).catch(next)
  }).catch(next) 
})

router.put('/:recordID', (req: Request, res: Response, next: Next) => {
  
})

router.delete('/:recordID', (req: Request, res: Response, next: Next) => {
     
})