'use strict'

import mongoose = require('mongoose')
import Field    = require('./field')

export interface FormRevisionInterface extends mongoose.Document {
  revision: number
  signatures: number
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
  // 簽核人數
  signatures: {
    type: Number,
    required: true,
    default: 1
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
    default: 3
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