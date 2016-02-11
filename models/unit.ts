'use strict'

import mongoose = require('mongoose')

const  ObjectId = mongoose.Schema.Types.ObjectId

export interface UnitInterface extends mongoose.Document {
  name: string
  identifier: number
  parentUnit?: string
  childUnits?: [string]
  manager?: string
  docsControl?: string
  agents?: [string]
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
  childUnits: {
    type: [ObjectId],
    required: false
  },
  manager: {
    type: ObjectId,
    required: false
  },
  docsControl: {
    type: ObjectId,
    required: false
  },
  agents: {
    type: [ObjectId],
    required: false
  }
})

export const Unit = mongoose.model<UnitInterface>('Unit', UnitSchema)