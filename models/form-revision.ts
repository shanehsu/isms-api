'use strict'

import mongoose = require('mongoose')
import Field    = require('./field')

export interface FormRevisionInterface extends mongoose.Document {
  revision: number,
  sinigtures: number,
  group: number,
  secrecyLevel: number,
  template: string,
  fields: [Field.FieldInterface]
}

export const FormRevisionSchema = new mongoose.Schema ({
  // 版本編號
  revision: {
    type: Number,
    required: true
  },
  // 簽核人數
  signigtures: {
    type: Number,
    required: true
  },
  // 填表群組
  group: {
    type: Number,
    required: true
  },
  // 機密等級
  secrecyLevel: {
    type: Number,
    required: true
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