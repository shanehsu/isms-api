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

// 路由器前置路徑 /forms/revisions/fields
var router = express.Router()

/**
 * GET /forms/revisions/fields/:formID/:revisionID/:fieldID
 * 
 * 取得特定的表單欄位
 */
router.get('/:formID/:revisionID/:fieldID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
  const formID: string = req.params.formID
  const revisionID: string = req.params.revisionID
  const fieldID: string = req.params.fieldID
  
  auth.return_user(token).then(user => {
    Form.findById(formID).exec().then(form => {
      let revisions = form.revisions
      
      let filteredRevision = revisions.filter(revision => revision.id == revisionID)
      if (filteredRevision.length == 0) {
        next(new Error('在表單內找不到此表單版本。'))
      } else {
        let revision = filteredRevision[0]
        let fields = revision.fields
        
        let filteredField = fields.filter(field => field.id == fieldID)
        if (filteredField.length == 0) {
          next(new Error('在表單版本內找不到此欄位。'))
        } else {
          let field = filteredField[0]
          res.json(field)
        }
      }
    }).catch(next)
  }).catch(next)
})

/**
 * POST /forms/revisions/fields/:formID/:revisionID
 */
router.post('/:formID/:revisionID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  const formID: string = req.params.formID
  const revisionID: string = req.params.revisionID
  
  auth.ensure_group(token, group).then(user => {
    Form.findById(formID).exec().then(form => {
      // 取得表單版本
      let revisions = form.revisions
      let revisionIndex = revisions.findIndex(revision => revision.id == revisionID)
      if (revisionIndex < 0) {
        next(new Error('無法找到該表單版本。'))
        return
      }
      
      // 更新前 ID
      let oldFieldIDs = []
      if (revisions[revisionIndex].fields) {
        oldFieldIDs = revisions[revisionIndex].fields.map(field => field.id)
      }
      
      // 更新
      let keyPath: string = 'revisions.' + revisionIndex + '.fields'
      let update: Object = {}
      update[keyPath] = {}
      
      Form.findByIdAndUpdate(formID, {
        '$push': update
      }, {
        'new': true
      }).exec().then((newForm) => {
        // 取得新的欄位 ID
        let newRevisions = newForm.revisions
        let newRevisionIndex = newRevisions.findIndex(revision => revision.id == revisionID)
        if (newRevisionIndex < 0) {
          next(new Error('無法取得新欄位的 ID，在查找表單版本時失敗。'))
          return
        }
        
        // 更新後 ID
        let newFieldIDs = newRevisions[newRevisionIndex].fields.map(field => field.id)
        let diff = newFieldIDs.filter(id => oldFieldIDs.indexOf(id) == -1)
        
        if (diff.length != 1) {
          next(new Error('無法查出新欄位 ID，計算差異時失敗。'))
        } else {
          res.send(diff[0])
        }
      }).catch(next)
    }).catch(next)
  }).catch(next)
})

/**
 * PUT /forms/revisions/fields/:formID/:revisionID/:fieldID
 */
router.put('/:formID/:revisionID/:fieldID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  const formID: string = req.params.formID
  const revisionID: string = req.params.revisionID
  const fieldID: string = req.params.fieldID
  
  auth.ensure_group(token, 1).then(() => {
    Form.findById(formID).exec().then(form => {
      // 表單版本
      let revisions = form.revisions
      let revisionIndex = revisions.findIndex(revision => revision.id == revisionID)
      if (revisionIndex == -1) {
        next(new Error('找不到指定的表單版本。'))
        return
      }
      let revision = revisions[revisionIndex]
      
      // 欄位
      let fields = revision.fields
      let fieldIndex = fields.findIndex(field => field.id == fieldID)
      if (fieldIndex == -1) {
        next(new Error('找不到指定的欄位。'))
        return
      }
      let field = fields[fieldIndex]
      
      // 進行更新
      if (req.body.name != undefined) field.name = req.body.name
      if (req.body.type != undefined) field.type = req.body.type
      if (req.body.hint != undefined) field.hint = req.body.hint
      if (req.body.metadata != undefined) {
        try {
          field.metadata = JSON.parse(req.body.metadata)
        } catch (e) {
          next(e)
        }
      }
      
      console.dir(field)
      
      form.markModified('revisions.' + revisionIndex + '.fields.' + fieldIndex)
      form.save(err => {
        if (err) {
          next(err)
        } else {
          res.sendStatus(200)
        }
      })
    }).catch(next)
  }).catch(next)
})

/**
 * DELETE /forms/revisions/fields/:formID/:revisionID/:fieldID
 */
router.delete('/:formID/:revisionID/:fieldID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  const formID: string = req.params.formID
  const revisionID: string = req.params.revisionID
  const fieldID: string = req.params.fieldID
  
  auth.ensure_group(token, 1).then(() => {
    Form.findById(formID).exec().then(form => {
      // 表單版本
      let revisions = form.revisions
      let revisionIndex = revisions.findIndex(revision => revision.id == revisionID)
      if (revisionIndex == -1) {
        next(new Error('找不到指定的表單版本。'))
        return
      }
      
      let keyPath = 'revisions.' + revisionIndex + '.fields'
      let update  = {}
      update[keyPath] = {_id: fieldID}
      
      Form.findByIdAndUpdate(formID, {
        '$pull': update
      }).exec().then(() => res.sendStatus(200)).catch(next)
    }).catch(next)
  }).catch(next)
})

module.exports = router

/*

router.get('/:formID/:revisionID/:fieldID', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
})

*/