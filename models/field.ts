'use strict'

import mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

export interface FieldInterface extends mongoose.Document {
  id: string
  name: string
  type: string
  hint?: string
  metadata?: any | Object
}

export const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '欄位名稱',
    required: true
  },
  type: {
    type: String,
    default: 'shortText',
    required: true,
    validate: [{
      validator: function (value) {
        return ['shortText', 'longText', 'date', 'time', 'options', 'table'].includes(value)
      },
      message: '{VALUE} is not a valid field type.'
    }]
  },
  hint: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
})
