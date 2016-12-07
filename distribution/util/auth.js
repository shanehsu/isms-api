'use strict';
const crypto = require('crypto');
const models_1 = require('./../libs/models');
function returnUser(token) {
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
}
exports.returnUser = returnUser;
function generatePassword(password) {
    return new Promise((resolve, reject) => {
        // 產生 salt、iteration
        crypto.randomBytes(128, (err, saltBuffer) => {
            if (err) {
                reject(err);
                return;
            }
            let salt = saltBuffer.toString('hex');
            let iterations = Math.ceil(Math.random() * 1000) + 1;
            crypto.pbkdf2(password, salt, iterations, 512, 'sha512', (err, key) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ hash: key.toString('hex'), salt: salt, iteration: iterations });
            });
        });
    });
}
exports.generatePassword = generatePassword;
//# sourceMappingURL=auth.js.map