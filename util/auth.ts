'use strict'

// TODO: 在這裡應該將 token 的 lastUsed 標成現在

import mongoose = require('mongoose')
import crypto = require('crypto')

import { User, UserInterface, PasswordInterface } from './../libs/models'

export function returnUser(token: string): Promise<mongoose._mongoose.Model<UserInterface>> {
  return new Promise<mongoose._mongoose.Model<UserInterface>>((resolve, reject) => {
    User.find({'tokens.token' : token}).limit(1).exec().then(doc => {
      if (doc.length == 0) {
        reject(new Error('代幣為 ' + token + '的使用者並不存在。'))
      } else {
        return resolve(doc[0])
      }
    }).catch(reject)
  })
}

export function generatePassword(password: string): Promise<PasswordInterface> {
  return new Promise<PasswordInterface>((resolve, reject) => {
    // 產生 salt、iteration
    crypto.randomBytes(128, (err, saltBuffer) => {
      if (err) { reject(err); return; }
      let salt = saltBuffer.toString('hex')
      let iterations = Math.ceil(Math.random() * 1000) + 1
      
      crypto.pbkdf2(password, salt, iterations, 512, 'sha512', (err: Error, key: Buffer | null) => {
        if (err) { reject(err); return; }
        resolve({ hash: key.toString('hex'), salt: salt, iteration: iterations })
      })
    })
  })
}
