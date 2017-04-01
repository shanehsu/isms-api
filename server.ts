'use strict'

let app = require('./app')
let debug = require('debug')('isms_api')
let greenlock = require('greenlock-express')

import http = require('http')
import spdy = require('spdy')
import redirect = require('redirect-https')

if (process.env.NOSSL) {
  http.createServer(app).listen(80)
} else {
  let lock = greenlock.create({
    "server": 'staging',
    "email": 'hsu.pengjun@icloud.com',
    "agreeTos": true,
    "approveDomains": ['changhua.shanehsu.idv.tw']
  })

  http.createServer(lock.middleware(redirect())).listen(80, () => {
    debug("在通訊埠 80 上處理 ACME 測驗")
  })

  spdy.createServer(lock.httpsOptions, lock.middleware(app)).listen(443, () => {
    debug("在通訊埠 443 上處理 ACME 測驗")
    debug("在通訊埠 443 上服務使用者")
  })
}
