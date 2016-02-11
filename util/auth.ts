'use strict'

// TODO: 在這裡應該將 token 的 lastUsed 標成現在

import {User, UserInterface} from './../libs/models'

let return_user = function(token: string): Promise<UserInterface> {
  return new Promise<UserInterface>((resolve, reject) => {
    User.find({'tokens.token' : token}).limit(1).exec().then(doc => {
      if (doc.length == 0) {
        reject(new Error('代幣為 ' + token + '的使用者並不存在。'))
      } else {
        return resolve(doc[0])
      }
    }).catch(reject)
  })
}

let validate_token = function(token: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    return_user(token).then(user => resolve()).catch(reject)
  })
}

let ensure_group = function(token: string, group: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    return_user(token).then((user) => {
      if (user.group == group) {
        resolve()
      } else {
        reject(new Error('使用者權限錯誤。'))
      }
    }).catch(reject)
  })
}

// Node Module

module.exports = {
  return_user: return_user,
  validate_token: validate_token,
  ensure_group: ensure_group
}

// TypeScript Module

export = {
  return_user: return_user,
  validate_token: validate_token,
  ensure_group: ensure_group
}