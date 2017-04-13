import express = require('express')
import { User, Unit, Group } from './../../libs/models'
import { generatePassword } from './../../util/auth'
import { ObjectID } from "mongodb"

export let usersRouter = express.Router()

usersRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req.group != 'admins') {
    res.status(401).send()
  } else {
    next()
  }
})
usersRouter.get('/', (req, res, next) => {
  User.find({}, { password: 0, tokens: 0 }).then(users => res.json(users)).catch(next)
})
usersRouter.get('/:id', (req, res, next) => {
  User.findById(req.params.id, { password: 0, "tokens.token": 0 }).then(user => {
    if (!user) {
      res.status(404).send()
      return
    }
    res.json(user)
  }).catch(next)
})
usersRouter.post('/', (req, res, next) => {
  User.create({}).then(user => res.status(201).send(user.id)).catch(next)
})
usersRouter.post('/:userId/actions/confirm', (req, res, next) => {
  let userId: string = req.params.userId
  User.findByIdAndUpdate(userId, { confirmed: true }).then(_ => res.status(201).send()).catch(next)
})
usersRouter.put('/:id', (req, res, next) => {
  delete req.body.tokens
  delete req.body.password
  delete req.body.confirmed

  User.findById(req.params.id).then(user => {
    if (!user) {
      res.status(404).send()
      return
    }
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
    if (!user) {
      res.status(404).send()
      return
    }
    Unit.aggregate([
      {
        $project: {
          _members: {
            $concatArrays: ["$members.none", "$members.agents", "$members.vendors", ["$members.manager"], ["$members.docsControl"]]
          },
          members: 1,
          name: 1,
          identifier: 1
        }
      },
      {
        $match: {
          _members: new ObjectID(user.id)
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
