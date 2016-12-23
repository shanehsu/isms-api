'use strict'

import mongoose = require('mongoose')

export interface PieceInterface extends mongoose.Document {
  id: string
  date: Date
  summary: string
  source: string
  link: string
}

export const PieceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: new Date(),
    required: true
  },
  summary: {
    type: String,
    default: '簡短標題',
    required: true
  },
  source: {
    type: String,
    default: '來源',
    required: true
  },
  link: {
    type: String,
    default: '#',
    required: true
  }
})

export const Piece = mongoose.model<PieceInterface>('Piece', PieceSchema)