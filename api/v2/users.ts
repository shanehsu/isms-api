import express = require('express')
import { User, Unit, Group } from './../../libs/models'
import { generatePassword } from './../../util/auth'

export let usersRouter = express.Router()

usersRouter.use((req, res, next) => {
  if (req['group'] as Group != 'admins') {
    res.status(401).send()
  } else {
    next()
  }
})

usersRouter.get('/', (req, res, next) => {
  User.find({}, { password: 0, tokens: 0 }).then(res.json).catch(next)
})

usersRouter.get('/:id', (req, res, next) => {
  User.findById(req.params.id, { password: 0, "tokens.token": 0 }).then(res.json).catch(next)
})

usersRouter.post('/', (req, res, next) => {
  User.create({}).then(user => res.status(201).send(user.id)).catch(next)
})

usersRouter.put('/:id', (req, res, next) => {
  delete req.body.tokens
  delete req.body.password
  
  User.findById(req.params.id).then(user => {
    let originalGroup = user.group
    if (originalGroup == "vendors") {
      delete req.body.group
    } else {
      if (req.body.group && req.body.group == "vendors") {
        next(new Error("不可以修改非廠商帳號的組別成為廠商。"))
        return
      }
    }
    
    User.findByIdAndUpdate(req.params.id, { $set: req.body }).then(_ => res.status(204).send()).catch(next)
  }).catch(next)
})

usersRouter.delete('/:id', (req, res, next) => {
  User.findById(req.params.id).then(user => {
    Unit.aggregate([
      {
        $project: {
          _members: {
            $concatArrays: ["$members.none", "$members.agents", ["$members.manager"], ["$members.docsControl"]]
          },
          members: 1,
          name: 1,
          identifier: 1
        }
      },
      {
        $match: {
          _members: user.id
        }
      }
    ]).then(units => {
      if (units.length > 0) {
        next(new Error('使用者目前隸屬於某個單位'))
      } else {
        User.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next)
      }
    }).catch(next)
  })
})

/*
usersRouter.delete('/:id/tokens/:tokenID', (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, { $pull: { tokens: { _id: req.params.tokenID } } }).then(_ => res.status(204).send()).catch(next)
})
*/
