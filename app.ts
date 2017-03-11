'use strict'

import express = require('express')
import { corsHeader, noCache, randomResponseTimeDelay } from './util/middlewares'
import { APIRouter } from './api/api'
import { ssoRouter } from './sso'

var isms_app: express.Express = require('./../isms-app/express-server').app
var mongoose = require('./util/mongoose')
var colors = require('colors/safe')
var logger = require('morgan')('dev')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var urlEncodedParser = bodyParser.urlencoded({ extended: true })
var jsonParser = bodyParser.json()

// 型態別稱
type Request = express.Request
type Response = express.Response
type Next = express.NextFunction

let app = express()

// 中介軟體
app.use(logger)
app.use(cookieParser())
app.use(jsonParser)
app.use(urlEncodedParser)
app.use(corsHeader)
app.use(noCache)

app.use((req, res, next) => {
  next()
})

// 網頁應用程式
let app_enabled = process.env.APP_ENABLED ? process.env.APP_ENABLED == 1 : true
if (app_enabled) {
  app.use('/app', isms_app)
}

// 路由
app.use(randomResponseTimeDelay)
app.use('/api', APIRouter)
app.use('/sso', ssoRouter)

// 404 處理常式
app.use((req: Request, res: Response, next: Next) => {
  res.status(404).json({
    message: "無法找到你所需要的資源。"
  })
})

// 錯誤處理常式
app.use((err: any, req: Request, res: Response, next: Next) => {
  console.log(colors.yellow('錯誤紀錄'))
  console.dir(err)
  res.status(500).json({
    message: err.message,
    object: err
  })
})

module.exports = app
