'use strict'

import express = require('express')

var mongoose = require('./util/mongoose')

// 型態別稱
type Request = express.Request
type Response = express.Response
type Next = express.NextFunction;

// 中介軟體
var logger = require('morgan')
var bodyParser = require('body-parser')

// 路由器
var pieces = require('./routes/pieces')
var auth = require('./routes/auth')
var tokens = require('./routes/tokens')
var users = require('./routes/users')
var units = require('./routes/units')
var forms = require('./routes/forms')
var records = require('./routes/records')

let app = express()

app.use(logger('dev'))
app.use(bodyParser.json())

// 允許第三方來源（Cross Origin）
// 允許標頭（Headers）
// 允許其他 HTTP 方法（POST、PUT 以及 DELETE）
app.use((req: Request, res: Response, next: Next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'token, Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    next()
})

// 不允許快取
app.use((req: Request, res: Response, next: Next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')
  next()
})

// 加上延遲，模擬真實情況
app.use((req: Request, res: Response, next: Next) => {
    setTimeout(() => {
      next()
    }, 0);
})

// 路徑
app.use('/pieces', pieces)
app.use('/auth', auth)
app.use('/tokens', tokens)
app.use('/users', users)
app.use('/units', units)
app.use('/forms', forms)
app.use('/records', records)

// 將 404 當作 500 處理
// 在這裡相當合適
app.use((req: Request, res: Response, next: Next) => {
    next(new Error('資源不存在'))
})

// 記錄錯誤
app.use((err: any, req: Request, res: Response, next: Next) => {
  console.error(err)
  console.error(err.message)
  res.status(500).send(err.message)
})

module.exports = app
