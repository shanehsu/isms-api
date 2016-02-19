'use strict'

import express = require('express')
import auth    = require('./../util/auth')

import {Form, FormInterface,
        FormRevisionInterface,
        FieldInterface} from './../libs/models'

// 型態別稱
type Request  = express.Request
type Response = express.Response
type Next     = express.NextFunction

var router = express.Router()

// 子路由器
router.use('/revisions', require('./forms.revisions'))

/**
 * 路徑清單
 * GET    /forms
 * GET    /forms/:id
 * POST   /forms
 * PUT    /forms/:id
 * DELETE /forms/:id
 */

/**
 * GET /forms
 * 
 * 取得該使用者可填寫的表單，
 * 只回傳該表單的 ID、名稱、表單 ID
 */
router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  auth.return_user(token).then(user => {
    
    let group = user.group
    
    Form.find({}).exec()
      .then(forms => {
        let payload = forms.filter(form => {
          if (group == 1) {
            return true
          } else {
            if (!form.revisions || form.revisions.length == 0) {
              return false
            } else {
              return form.revisions[form.revisions.length - 1].group <= group
            }
          }
        }).map(form => {
          return {
            _id: form.id, 
            name: form.name,
            identifier: form.identifier
          }
        })
        
        res.json(payload)
      })
      .catch(next)
  }).catch(next)
})

/**
 * POST /forms
 * 
 * 建立一個空的表單資源
 */
router.post('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  auth.ensure_group(token, group).then(() => {
    Form.create({}).then(form => res.status(201).send(form.id))
                   .catch(next)
  }).catch(next)
})

/**
 * GET /forms/:id
 * 
 * 取得特定表單
 * 回傳表單的所有資訊
 */
router.get('/:id', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const id: string    = req.params.id
  
  auth.return_user(token).then(user => {
    let user_group = user.group
    Form.findById(id).exec().then(form => {
      // 使用者應該可以看到的 Revision => ID
      let ids: string[] = []
      if (form.revisions) {
        ids = form.revisions.filter(revision => revision.group >= user.group)
                            .map(revision => revision.id)
      }
      
      // 取代原本資料
      let payload: any = form
      payload.revisions = ids
      
      res.json(payload)
    }).catch(next)
  }).catch(next)
})

/**
 * PUT /forms/:id
 * 
 * 更新一個表單的名稱或是表單 ID。
 */

router.put('/:id', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  const id: string    = req.params.id
  
  auth.ensure_group(token, group).then(() => {
    delete req.body.revisions
    Form.findByIdAndUpdate(id, {
      $set: req.body
    }).exec().then(() => res.sendStatus(200)).catch(next)
  }).catch(next)
})

/**
 * DELETE /forms/:id
 * 
 * 刪除一個表單
 */

router.delete('/:id', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  const id: string    = req.params.id
  
  auth.ensure_group(token, group).then(() => {
    Form.findOneAndRemove(id).exec()
        .then(() => res.sendStatus(200)).catch(next)
  }).catch(next)
})

module.exports = router
