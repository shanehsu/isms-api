'use strict'

import mongoose = require('mongoose')
import Token = require('./token')
import { PasswordInterface, PasswordSchema } from './password'

export type Group = "admins" | "securityPersonnel" | "users" | "vendors" | "guests"

export interface UserInterface extends mongoose.Document {
  id?: string
  email: string
  name: string
  password?: PasswordInterface
  group: Group
  tokens: Token.TokenInterface[]
  confirmed: boolean
}

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    default: 'user@cc.ncue.edu.tw',
    required: true,
    unique: true
  },
  password: {
    type: PasswordSchema,
    required: false
  },
  name: {
    type: String,
    default: '王大明',
    required: true
  },
  group: {
    type: String,
    default: 'users',
    required: true
  },
  tokens: {
    type: [Token.TokenSchema],
    default: [],
    required: false
  },
  confirmed: {
    type: Boolean,
    default: true,
    required: true
  }
})

export const User = mongoose.model<UserInterface>('User', UserSchema)