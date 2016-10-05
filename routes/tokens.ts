'use strict'

import express = require('express')
import auth    = require('../util/auth')

import {User}  from './../libs/models'

// 型態別稱
type Request  = express.Request
type Response = express.Response
type Next     = express.NextFunction

var router    = express.Router();

/**
 * GET /tokens
 * 
 * 取得該使用者的所有登入代幣
 */
router.get('/', (req: Request, res: Response, next: Next) => {
  const token: string = req.get('token')
  
  auth.return_user(token)
      .then(user => res.json(user.tokens))
      .catch(next)
});

/**
 * POST /tokens/valid
 * 
 * 回傳登入代幣是否有效。
 */
router.post('/valid', (req: Request, res: Response) => {
  const token: string = req.body.token
  
  auth.validate_token(token)
      .then(() => res.json({valid: true}))
      .catch(() => res.json({valid: false})
  )
})

/**
 * DELETE /tokens/:id
 * 
 * 刪除一個登入代幣。
 */
router.delete('/:id', function(req, res, next) {
  const token: string = req.get('token')
  const id: string    = req.params.id
  
  auth.return_user(token)
      .then(user => {
        user.tokens.filter(token => token['id'] != id)
        user.save((err: Error) => {
          if (err) {
            next(err)
          } else {
            res.sendStatus(200)
          }
        })
      }).catch(next)
});

module.exports = router;
