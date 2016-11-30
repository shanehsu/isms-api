import express = require('express')
import {V1Router} from './v1/main'
import {V2Router} from './v2/main'
export let APIRouter = express.Router()

// APIRouter.use('/v1', V1Router)
APIRouter.use('/v2', V2Router)
