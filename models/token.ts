'use strict'

import mongoose = require('mongoose')

export interface TokenInterface {
  token: string
  origin: string
  userAgent: string
  used: Date
}

export const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    requied: true
  },
  used: {
    type: Date,
    required: true
  }
})