'use strict'

import mongoose     = require('mongoose')
import FormRevision = require('./form-revision')

export interface FormInterface extends mongoose.Document {
  identifier?: string
  revisions?: [FormRevision.FormRevisionInterface]
}

export const FormSchema = new mongoose.Schema ({
  identifier: {
    type: String,
    required: false
  },
  // 各個版本
  revesions: {
    type: [FormRevision.FormRevisionSchema],
    required: false
  }
})

export const Form = mongoose.model<FormInterface>('Form', FormSchema)
