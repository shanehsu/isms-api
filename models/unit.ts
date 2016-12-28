'use strict'

import mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

export interface UnitInterface extends mongoose.Document {
  id?: string
  name: string
  identifier: number
  parentUnit?: string

  members: {
    none: string[],
    agents: string[],
    vendors: string[],
    docsControl?: string,
    manager?: string
  }
}

export const UnitSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '單位名稱',
    required: true
  },
  identifier: {
    type: Number,
    default: 0,
    required: true
  },
  parentUnit: {
    type: ObjectId,
    required: false
  },
  members: {
    none: {
      type: [ObjectId]
    },
    manager: {
      type: ObjectId,
    },
    docsControl: {
      type: ObjectId
    },
    agents: {
      type: [ObjectId]
    },
    vendors: {
      type: [ObjectId]
    }
  }
})

export const Unit = mongoose.model<UnitInterface>('Unit', UnitSchema)