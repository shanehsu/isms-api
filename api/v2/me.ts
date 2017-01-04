import express = require('express')
import mongoose = require('mongoose')
import { User, UserInterface, Unit, UnitInterface, Group } from './../../libs/models'
import { generatePassword } from './../../util/auth'

export let meRouter = express.Router()

meRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req['group'] as Group == 'guests') {
    res.status(401).send()
  } else {
    next()
  }
})

meRouter.get('/', (req, res, next) => {
  let user = req.user

  Unit.find({
    "$or": [
      { "members.none": user.id },
      { "members.docsControl": user.id },
      { "members.agent": user.id },
      { "members.manager": user.id },
      { "members.vendors": user.id }
    ]
  }).then(units => {
    if (units.length > 0) {
      let unit: UnitInterface = units[0] as any
      (unit as any).role = {
        agent: unit.members.agents.includes(user.id),
        manager: unit.members.manager == user.id,
        docsControl: unit.members.docsControl == user.id
      };

      delete unit._id;
      delete unit.members;
      delete unit.parentUnit;

      (user as any).unit = unit
    }

    delete user.password

    res.json(user)
  }).catch(next)
})

meRouter.delete('/tokens/:tokenID', (req, res, next) => {
  User.findByIdAndUpdate(req['user'].id, { $pull: { tokens: { _id: req.params.tokenID } } }).then(_ => res.status(204).send()).catch(next)
})

meRouter.put('/password', (req, res, next) => {
  generatePassword(req.body.password).then(password => {
    User.findOneAndUpdate({ _id: req.params.id, group: 'vendors' }, { $set: { password: password } }).then(_ => res.status(204).send()).catch(next)
  }).catch(next)
})
