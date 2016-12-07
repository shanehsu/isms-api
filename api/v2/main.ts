import express = require('express')

import { returnUser } from './../../util/auth'
import { Group } from './../../libs/models'
import { loginRouter } from './login'
import { newsRouter } from './news'
import { usersRouter } from './users'
import { meRouter } from './me'
import { registerRouter } from './register'
import { formsRouter } from './forms'
export let V2Router = express.Router()

V2Router.use((req, res, next) => {
  let token: string | undefined = req.get('token')
  if (token != undefined) {
    returnUser(token).then(user => {
      req['user'] = user
      req['authenticated'] = true
      req['group'] = user.group
      
      next()
    }).catch(err => next(err))
  } else {
    req['user'] = undefined
    req['authenticated'] = false
    req['group'] = 'guests' as Group
    
    next()
  }
})

V2Router.use('/login', loginRouter)
V2Router.use('/news', newsRouter)
V2Router.use('/users', usersRouter)
V2Router.use('/me', meRouter)
V2Router.use('/register', registerRouter)
V2Router.use('/forms', formsRouter)

