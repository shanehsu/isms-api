'use strict'

import mongoose = require('mongoose')
import Field = require('./field')

export interface FormRevisionInterface extends mongoose.Document {
  revision: number
  signatures: boolean
  skipImmediateChief: boolean
  published: boolean
  group: {
    "securityPersonnel": boolean,
    "users": boolean,
    "vendors": boolean
  }
  secrecyLevel: number
  template: string
  fields: Field.FieldInterface[]
}

export const FormRevisionSchema = new mongoose.Schema({
  // 版本編號
  revision: {
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
  group: {
    type: {
      "securityPersonnel": Boolean,
      "users": Boolean,
      "vendors": Boolean
    },
    required: true,
    default: {
      "securityPersonnel": false,
      "users": false,
      "vendors": false
    }
  },
  // 機密等級
  secrecyLevel: {
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