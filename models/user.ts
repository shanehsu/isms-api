'use strict'

import mongoose = require('mongoose')
import Token    = require('./token')

export interface UserInterface extends mongoose.Document {
  email: string
  name: string
  group: number
  unit?: string
  tokens: [Token.TokenInterface]
}

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    default: 'user@cc.ncue.edu.tw',
    required: true
  },
  name: {
    type: String,
    default: '王大明',
    required: true
  },
  group: {
    type: Number,
    default: 2,
    required: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  tokens: {
    type: [Token.TokenSchema],
    default: [],
    required: false
  }
})

export const User = mongoose.model<UserInterface>('User', UserSchema)