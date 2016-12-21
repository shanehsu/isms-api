// This module should include the following capability
// - CRUD operations on unit
// - Unit relationship management
// - Member management

import express = require('express')
import { User, UserInterface, Group } from './../../libs/models'
import { Unit, UnitInterface } from './../../libs/models'

export let unitsRouter = express.Router()

/** 
 * GET /
 * POST /
 * PUT /:unitId
 * DELETE /:unitId
 */

unitsRouter.use((req, res, next) => {
  if (req.method.toLowerCase() == 'options') { next(); return; }
  if (req['group'] as Group == 'guests') {
    next()
  } else {
    res.status(401).send()
  }
})

unitsRouter.get('/', (req, res, next) => {
  // 取得所有單位資訊
  Unit.find({}).then(units => res.json(units)).catch(next)
})

unitsRouter.post('/', (req, res, next) => {
  // 新增單位
  Unit.create({}).then(_ => res.status(201).send()).catch(next)
})

unitsRouter.put('/:unitId', (req, res, next) => {
  // 取得所有單位資料
  async function complexHandler() {
    let unitId: string = req.params.unitId
    let units = await Unit.find({}).exec()
    let updatingUnit = units.find(u => u.id == unitId)
    if (!updatingUnit) {
      throw new Error(`找不到 ID 為 ${unitId} 的單位`)
    }

    // 整理資料
    let unitsDictionary: { [id: string]: UnitInterface } = {}
    for (let unit of units) {
      unitsDictionary[unit.id] = unit
    }

    // 檢查兩件事情
    // 1. 新的單位歸屬是否會造成循環
    // 2. 新的成員歸屬是否合理，有沒有成員屬於兩個單位或是成員不存在

    // 將要檢查的資料合併
    let update = <UnitInterface>req.body
    unitsDictionary[unitId].parentUnit = update.parentUnit
    unitsDictionary[unitId].members = update.members

    // 先檢查 (1)
    // 檢查方法：從本次所要更新的單位（簡稱單位 U）開始，將單位按照「子 -> 母」的方向放入陣列中，
    // 若再次遇到 U 則形成循環
    let traversingUnitId = unitId
    if (!unitsDictionary[traversingUnitId]) {
      throw new Error(`找不到 id 為 ${traversingUnitId} 的單位`)
    }
    while (unitsDictionary[traversingUnitId].parentUnit) {
      traversingUnitId = unitsDictionary[traversingUnitId].parentUnit
      if (traversingUnitId == unitId) {
        throw new Error(`新的單位歸屬會形成循環`)
      }
      if (!unitsDictionary[traversingUnitId]) {
        throw new Error(`找不到 id 為 ${traversingUnitId} 的單位`)
      }
    }

    // 沒有循環，檢查 (2)
    // 檢查方法：將其他單位的成員全部加入一個集合，更新後的單位成員必不能在該集合中
    let occupiedUsers = new Set<string>()
    for (let unit of units) {
      let members = [
        unit.members.docsControl,
        unit.members.manager,
        ...unit.members.agents,
        ...unit.members.vendors,
        ...unit.members.none
      ]
      for (let member of members) {
        occupiedUsers.add(member)
      }
    }
    let newMembers = [
      unitsDictionary[unitId].members.docsControl,
      unitsDictionary[unitId].members.manager,
      ...unitsDictionary[unitId].members.agents,
      ...unitsDictionary[unitId].members.vendors,
      ...unitsDictionary[unitId].members.none
    ]

    // a. 成員必須存在於資料庫中
    let membersPromise = User.find({
      "_id": {
        "$in": newMembers
      }
    }).exec()

    let users = await membersPromise
    if (users.length == newMembers.length) {
      throw new Error('成員不存在於資料庫中')
    }

    for (let member of newMembers) {
      // b. 必須不存在於集合中
      if (occupiedUsers.has(member)) {
        throw new Error('成員目前已經屬於另外一個單位')
      }
    }

    let result = await Unit.findByIdAndUpdate(unitId, { "$set": update }).exec()
    return
  }

  complexHandler().then(_ => res.status(204).send()).catch(next)
})

unitsRouter.delete('/:unitId', (req, res, next) => {
  // 刪除單位
  Unit.findByIdAndRemove(req.params.unitId).then(_ => res.send()).catch(next)
})



