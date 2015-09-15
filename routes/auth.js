// Prefix: /token

var express = require('express');
var jwt     = require('jsonwebtoken');

var router = express.Router();

router.get('/login', function(req, res, next) {
    next(new Error('not implemented'));
    // 這邊應該重新導向使用者至認證畫面
});

module.exports = router;
