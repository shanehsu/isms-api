import express = require('express')
import { User, Group, TokenInterface } from './../../libs/models'
import request = require('request-promise-native')
import crypto = require('crypto')

import { validate } from './../../sso'

export let loginRouter = express.Router()

loginRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  let group = req.group
  if (group == "guests") {
    next()
  } else {
    res.status(401).send()
  }
})

loginRouter.post('/sso', (req, res, next) => {
  let ssoToken = req.body.sso_token
  if (ssoToken) {
    validate(ssoToken).then(value => {
      if (value && value.valid == true && value.email) {
        let t = token(req)
        User.find({ email: value.email }).then(users => {
          if (users.length == 1) {
            User.findByIdAndUpdate(users[0].id, {
              $push: { tokens: t }
            }).then(_ => res.json({ success: true, token: t.token })).catch(err => next(err))
          } else if (users.length == 0) {
            res.status(500).json({
              success: false,
              message: '您的帳號不在該系統內，請通知系統管理員。'
            })
          } else {
            next(new Error('使用電子郵件搜尋使用者時，資料庫回傳多個項目。'))
          }
        }).catch(err => next(err))
      }
    }).catch(err => next(err))
  } else {
    res.status(500).json({
      success: false,
      message: '必須有 sso-token 這個餅乾屑。'
    })
  }
})

loginRouter.post('/standalone', (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  if (email && password) {
    User.findOne({ email: email, group: 'vendors', confirmed: 'true' }).then(user => {
      if (user) {
        crypto.pbkdf2(password, user.password.salt, user.password.iteration, 512, 'sha512', (err: Error, key: Buffer | null) => {
          if (err) {
            next(err)
          } else {
            let digest = key.toString('hex')
            if (digest == user.password.hash) {
              let t = token(req)

              User.findByIdAndUpdate(user.id, {
                $push: { tokens: t }
              }).then(_ => {
                res.json({ success: true, token: t.token })
              }).catch(err => next(err))
            } else {
              res.status(500).json({ success: false, message: '登入資訊錯誤。' })
            }
          }
        })
      } else {
        res.status(500).json({ success: false, message: '登入資訊錯誤。' })
      }
    }).catch(err => next(err))
  } else {
    res.status(500).json({ success: false, message: '登入資訊錯誤。' })
  }
})

/* 輔助函數 */

/**
 * 從一個要求取得一個隨機產生的代幣結構
 * 
 * @param {Express.Request} req 要求 
 */
function token(req: express.Request): TokenInterface {
  return {
    token: crypto.randomBytes(16).toString('hex'),
    used: new Date(),
    origin: req.ip,
    userAgent: req.headers['user-agent']
  }
}
