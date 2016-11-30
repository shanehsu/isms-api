'use strict'

import express = require('express')
import auth    = require('../../util/auth')

import {Piece} from './../../libs/models'

// 型態別稱
type Request  = express.Request
type Response = express.Response
type Next     = express.NextFunction

var router = express.Router()

/**
 * GET /pieces
 * 
 * 回傳所有最新消息。 
 */
router.get('/', (req: Request, res: Response, next: Next) => {
  Piece.find({}).sort({ date: 'descending' }).exec()
       .then(docs => res.json(docs))
       .catch(next)
})

/**
 * GET /pieces/:id
 * 
 * 回傳一筆最新消息。
 */
router.get('/:id', (req: Request, res: Response, next: Next) => {
  const id: string = req.params.id
  
  Piece.findById(id).exec()
       .then(piece => res.json(piece))
       .catch(next)
})

/**
 * POST /pieces
 * 
 * 新增一個空的最新消息。
 * 回傳一個 ID 指向該資源。
 */
router.post('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const group: number = 1
  
  auth.ensureGroup(token, group)
      .then(() => {
        Piece.create({})
             .then(doc => res.status(201).send(doc.id))
             .catch(next)
      })
      .catch(next)
});

/**
 * PUT /pieces/:id
 * 
 * 更新一個最新消息的資訊。
 */
router.put('/:id', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const id: string    = req.params.id
  const group: number = 1
  
  auth.ensureGroup(token, group)
      .then(() => {
        Piece.findByIdAndUpdate(id, {$set: req.body}).exec()
             .then(() => res.sendStatus(204))
             .catch(next)
      })
      .catch(next);
})

/**
 * DELETE /pieces/:id
 * 
 * 刪除一個最新消息。
 */
router.delete('/:id', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  const id: string    = req.params.id
  const group: number = 1
  
  auth.ensureGroup(token, group)
      .then(() => {
        Piece.findByIdAndRemove(id).exec()
             .then(() => res.sendStatus(200))
             .catch(next)
      })
      .catch(next)
})

module.exports = router;
