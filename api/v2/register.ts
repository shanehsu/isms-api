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
  if (req.body.password.length < 6 || req.body.name.length == 0) { res.status(500).send(); return; }
  generatePassword(req.body.password).then(password => {
    User.create({
      email: req.body.email,
      name: req.body.name,
      password: password,
      group: "vendors" as Group,
      tokens: [],
      confirmed: false
    }).then(_ => res.status(201).send()).catch(next)
  }).catch(next)
})
