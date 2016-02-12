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

/**
 * 路徑清單
 * GET    /forms
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
    Form.find({
      $where: function() {
        var length = this.revisions.length
        return this.revisions[length - 1].group <= group
      }
    }).select('identifier name').exec()
      .then(forms => res.json(forms))
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
      let form_group = form.revisions[form.revisions.length - 1].group
      if (user_group >= form_group) {
        res.json(form)
      }
    }).catch(next)
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

/*

== GET ==

router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
})

*/