import express = require('express')
import { Piece, Group }  from './../../libs/models'

export let newsRouter = express.Router()

newsRouter.get('/', (req, res, next) => {
  if (req.query && req.query.page) {
    let page = +req.query.page - 1
    Piece.find().sort({ date: 'descending' }).skip(page * 10).limit(10).then(data => res.json(data)).catch(next)
  } else {
    Piece.find().sort({ date: 'descending' }).then(data => res.json(data)).catch(next)
  }
})

newsRouter.get('/:id', (req, res, next) => {
  const id = req.params.id
  Piece.findById(id).then(p => res.json(p)).catch(next)
})

newsRouter.post('/', (req, res, next) => {
  let group = req['group'] as Group
  if (group == "admins") {
    Piece.create({}).then(piece => res.status(201).send(piece.id)).catch(next)
  } else {
    res.status(401).send()
  }
})

newsRouter.put('/:id', (req, res, next) => {
  let group = req['group'] as Group
  if (group == "admins") {
    const id = req.params.id
    Piece.findByIdAndUpdate(id, { $set: req.body }).then(_ => res.status(204).send()).catch(next)
  } else {
    res.status(401).send()
  }
})

newsRouter.delete('/:id', (req, res, next) => {
  let group = req['group'] as Group
  if (group == 'admins') {
    Piece.findByIdAndRemove(req.params.id).then(_ => res.send()).catch(next)
  } else {
    res.status(401).send()
  }
})
