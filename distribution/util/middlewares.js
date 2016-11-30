"use strict";
function corsHeader(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'token, Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
}
exports.corsHeader = corsHeader;
function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}
exports.noCache = noCache;
function randomResponseTimeDelay(req, res, next) {
    setTimeout(() => { next(); }, Math.random() * 750);
}
exports.randomResponseTimeDelay = randomResponseTimeDelay;
//# sourceMappingURL=middlewares.js.map