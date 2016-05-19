'use strict'

import mongoose = require('mongoose')
import Field    = require('./field')

export interface FormRevisionInterface extends mongoose.Document {
  revision: number
  signatures: boolean
  officerSignature: boolean
  group: number
  secrecyLevel: number
  template: string
  fields: [Field.FieldInterface]
}

export const FormRevisionSchema = new mongoose.Schema ({
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
  officerSignature: {
    type: Boolean,
    required: true,
    default: false
  },
  // 填表群組
  group: {
    type: Number,
    required: true,
    default: 3
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