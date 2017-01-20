'use strict'

import mongoose = require('mongoose')
import FormRevision = require('./form-revision')

export interface FormInterface extends mongoose.Document {
  id?: string
  identifier?: string
  name?: string
  revisions?: FormRevision.FormRevisionInterface[]
}

export const FormSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    default: 'ISMS-NEW'
  },
  name: {
    type: String,
    required: true,
    default: '新的表單'
  },
  // 各個版本
  revisions: {
    type: [FormRevision.FormRevisionSchema],
    required: false,
    default: []
  }
})

export const Form = mongoose.model<FormInterface>('Form', FormSchema)
