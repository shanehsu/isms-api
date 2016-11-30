import mongoose = require('mongoose')

export interface PasswordInterface {
  hash: string
  salt: string
  iteration: number
}

export const PasswordSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  iteration: {
    type: Number,
    requied: true
  }
})