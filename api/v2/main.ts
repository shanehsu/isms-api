import express = require('express')

import { returnUser } from './../../util/auth'
import { User, Group } from './../../libs/models'
import { loginRouter } from './login'
import { newsRouter } from './news'
import { usersRouter } from './users'
import { meRouter } from './me'
import { registerRouter } from './register'
import { formsRouter } from './forms'
import { recordsRouter } from './records'
import { unitsRouter } from './units'
export let V2Router = express.Router()

V2Router.use(async (req, res, next) => {
  let token: string | undefined = req.header('token')

  if (token != undefined) {
    try {
      let users = await User.find({ 'tokens.token': token }).limit(1)
      if (users[0]) {
        console.log('authenticated!')
        req.user = users[0]
        req.authenticated = true
        req.group = users[0].group
        next()
      } else {
        console.log('not authenticated! -- 1')
        req.user = null
        req.authenticated = false
        req.group = 'guests'
        next()
      }
    } catch (err) {
      res.status(500).json({
        message: `取得使用者時，資料庫錯誤`,
        raw: err
      })
    }
  } else {
    console.log('not authenticated! -- 2')
    req.user = null
    req.authenticated = false
    req.group = 'guests'
    next()
  }
})

V2Router.use('/login', loginRouter)
V2Router.use('/news', newsRouter)
V2Router.use('/users', usersRouter)
V2Router.use('/me', meRouter)
V2Router.use('/register', registerRouter)
V2Router.use('/forms', formsRouter)
V2Router.use('/records', recordsRouter)
V2Router.use('/units', unitsRouter)
