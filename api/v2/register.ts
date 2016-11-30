import express = require('express')
import { User, Group, TokenInterface }  from './../../libs/models'
import { generatePassword } from './../../util/auth'

export let registerRouter = express.Router()

registerRouter.use((req, res, next) => {
  let group = req['group'] as Group
  if (group == "guests") {
    next()
  } else {
    res.status(401).send()
  }
})

registerRouter.post('/', (req, res, next) => {
  User.create({
    email: req.body.email,
    name: req.body.name,
    password: generatePassword(req.body.password),
    group: "vendors" as Group,
    tokens: [],
    confirmed: false
  }).then(_ => res.status(201).send()).catch(next)
})
