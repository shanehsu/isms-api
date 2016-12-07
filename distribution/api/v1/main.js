"use strict";
const express = require('express');
var pieces = require('./pieces');
var auth = require('./auth');
var tokens = require('./tokens');
var users = require('./users');
var units = require('./units');
var forms = require('./forms');
var records = require('./records');
exports.V1Router = express.Router();
exports.V1Router.use('/pieces', pieces);
exports.V1Router.use('/auth', auth);
exports.V1Router.use('/tokens', tokens);
exports.V1Router.use('/users', users);
exports.V1Router.use('/units', units);
exports.V1Router.use('/forms', forms);
exports.V1Router.use('/records', records);
//# sourceMappingURL=main.js.map