'use strict';
const models_1 = require("./../libs/models");
let return_user = function (token) {
    return new Promise((resolve, reject) => {
        models_1.User.find({ 'tokens.token': token }).limit(1).exec().then(doc => {
            if (doc.length == 0) {
                reject(new Error('代幣為 ' + token + '的使用者並不存在。'));
            }
            else {
                return resolve(doc[0]);
            }
        }).catch(reject);
    });
};
let validate_token = function (token) {
    return new Promise((resolve, reject) => {
        return_user(token).then(user => resolve()).catch(reject);
    });
};
let ensure_group = function (token, group) {
    return new Promise((resolve, reject) => {
        return_user(token).then((user) => {
            if (user.group == group) {
                resolve();
            }
            else {
                reject(new Error('使用者權限錯誤。'));
            }
        }).catch(reject);
    });
};
// Node Module
module.exports = {
    return_user: return_user,
    validate_token: validate_token,
    ensure_group: ensure_group
};
module.exports = {
    return_user: return_user,
    validate_token: validate_token,
    ensure_group: ensure_group
};
//# sourceMappingURL=auth.js.map