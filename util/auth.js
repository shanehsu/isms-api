var User = require('../models/user');

var return_user = function(token) {
    return new Promise(function(resolve, reject) {
        User.find({'tokens.token' : token}).limit(1).then(function(doc) {
            if (doc.length == 0) {
                reject(new Error('User with such token does not exist.'))
            } else {
                return resolve(doc[0]);
            }
        }).catch(reject);
    });
};

var validate_token = function(token) {
    return new Promise(function(resolve, reject) {
        return_user(token).then(function(user) {
            resolve();
        }).catch(reject);
    });
};

var ensure_group = function(token, group) {
    return new Promise(function(resolve, reject) {
        return_user(token).then(function(user) {
            if (user.group == group) {
                resolve();
            } else {
                reject(new Error(403))
            }
        }).catch(reject);
    });
}

module.exports = {
    validate_token: validate_token,
    return_user: return_user,
    ensure_group: ensure_group
};
