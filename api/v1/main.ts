import express = require('express')

var pieces = require('./pieces')
var auth = require('./auth')
var tokens = require('./tokens')
var users = require('./users')
var units = require('./units')
var forms = require('./forms')
var records = require('./records')

export let V1Router = express.Router()

V1Router.use('/pieces', pieces)
V1Router.use('/auth', auth)
V1Router.use('/tokens', tokens)
V1Router.use('/users', users)
V1Router.use('/units', units)
V1Router.use('/forms', forms)
V1Router.use('/records', records)
