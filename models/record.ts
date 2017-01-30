'use strict'

import mongoose = require('mongoose')
import Field = require('./field')

const ObjectId = mongoose.Schema.Types.ObjectId

export interface RecordInterface extends mongoose.Document {
  id?: string
  formId?: string
  formRevision?: string
  owningUnit?: string
  created?: Date
  serial?: number
  generatedSerial?: string
  owner?: string
  status?: "awaiting_review" | "accepted" | "declined"
  signatures?: {
    personnel: string,
    timestamp: Date,
    signed: boolean,
    as: string
  }[]
  contents?: any
}

export const RecordSchema = new mongoose.Schema({
  // 對應到表單的格式
  formId: {
    type: ObjectId,
    required: true
  },
  formRevision: {
    type: ObjectId,
    required: true
  },

  // 對應到一個單位
  owningUnit: {
    type: ObjectId,
    required: true
  },

  // 對應到填寫日
  created: {
    type: Date,
    default: new Date()
  },

  // 對應到流水號
  serial: {
    type: Number,
    required: true
  },

  // 表單編號
  generatedSerial: {
    type: String,
    required: true
  },

  // 對應到填寫者
  owner: {
    type: ObjectId,
    required: true
  },

  status: {
    type: mongoose.Schema.Types.String,
    required: true
  },

  // 需要簽核的話，對應到簽核者
  signatures: {
    type: [
      {
        personnel: ObjectId,
        timestamp: Date,
        signed: Boolean,
        as: String
      }
    ],
    required: true
  },

  // 表單資料
  contents: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    required: true
  }
})

export const Record = mongoose.model<RecordInterface>('Record', RecordSchema)
