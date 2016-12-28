'use strict'

import mongoose = require('mongoose')
import Field = require('./field')
import { Group } from './user'

export interface FormRevisionInterface extends mongoose.Document {
  id?: string
  number: number
  signatures: boolean
  skipImmediateChief: boolean
  published: boolean
  groups: Group[]
  secrecy: number
  template: string
  fields: Field.FieldInterface[]
}

export const FormRevisionSchema = new mongoose.Schema({
  // 版本編號
  number: {
    type: Number,
    required: true
  },
  // 簽核
  signatures: {
    type: Boolean,
    required: true,
    default: false
  },
  skipImmediateChief: {
    type: Boolean,
    required: true,
    default: false
  },
  published: {
    type: Boolean,
    required: true,
    default: false
  },
  // 填表群組
  groups: {
    type: [String],
    required: true,
    default: ["securityPersonnel"]
  },
  // 機密等級
  secrecy: {
    type: Number,
    required: true,
    default: 4
  },
  // 樣板
  template: {
    type: String,
    required: false
  },
  // 表單格式
  fields: {
    type: [Field.FieldSchema],
    requied: false
  }
})