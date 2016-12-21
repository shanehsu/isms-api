'use strict'

import mongoose = require('mongoose')
import Field    = require('./field')

const  ObjectId = mongoose.Schema.Types.ObjectId

export interface RecordInterface extends mongoose.Document {
  formID?: string
  formRevision?: string
  owningUnit?: string
  created?: Date
  serial?: number
  generatedSerial?: string  
  owner?: string
  signatures?: {
    personnel: string,
    timestamp: Date,
    signed: boolean
  }[],
  contents?: any
}

export const RecordSchema = new mongoose.Schema ({
  // 對應到表單的格式
  formID: {
    type: ObjectId,
    required: false
  },
  formRevision: {
    type: ObjectId,
    required: false
  },
  
  // 對應到一個單位
  owningUnit: {
    type: ObjectId,
    required: false
  },
  
  // 對應到填寫日
  created: {
    type: Date,
    required: true,
    default: new Date()
  },
  
  // 對應到流水號
  serial: {
    type: Number,
    required: false
  },

  // 表單編號
  generatedSerial: {
    type: String,
    required: false
  },
  
  // 對應到填寫者
  owner: {
    type: ObjectId,
    required: false
  },
  
  // 需要簽核的話，對應到簽核者
  signatures: {
    type: [
      {
        personnel: ObjectId,
        timestamp: Date,
        signed: Boolean
      }
    ],
    required: false
  },
  
  // 表單資料
  contents: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    required: true
  }
})

export const Record = mongoose.model<RecordInterface>('Record', RecordSchema)
