var User = require('../models/user');

var return_user = function(token) {
    User.find({'tokens.token' : token}).limit(1).then(function(doc) {
        if (doc.length == 0) {
            return null;
        } else {
            return doc;
        }
    }).catch(function(err) {
        return null;
    });
};

var validate_token = function(token) {
    return (return_user == null) ? false : true;
};

exports = {
    validate_token: validate_token,
    return_user: return_user
};
