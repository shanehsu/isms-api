"use strict";
const express = require("express");
const main_1 = require("./v2/main");
exports.APIRouter = express.Router();
// APIRouter.use('/v1', V1Router)
exports.APIRouter.use('/v2', main_1.V2Router);
//# sourceMappingURL=api.js.map