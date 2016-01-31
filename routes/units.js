// Prefix: /units

var express = require('express');
var Unit = require('../models/unit');
var User = require('../models/user');
var router = express.Router();
var authutils = require('../util/auth');

router.get('/', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        Unit.find({}).then(function(units) {
            res.json(units);
        }).catch(next);
    }).catch(next);
});

router.post('/', function(req, res, next) {
    authutils.ensure_group(req.get('token'), 1).then(function() {
        var newUnit = new Unit(req.body);
        newUnit.save().then(function(unit) {
          res.status(201);
          res.send(unit.id);
        }).catch(next);
    }).catch(next);
});

router.put('/relateParent', function(req, res, next) {
  var parentID = req.body.parent;
  var childID  = req.body.child;

  authutils.ensure_group(req.get('token'), 1).then(function() {
    removeParent(childID).then(function() {
      Unit.findByIdAndUpdate(parentID, {
        $push: {
          childUnits: childID
        }
      }).then(function() {
        Unit.findByIdAndUpdate(childID, {
          parentUnit: parentID
        }).then(function() {
          res.sendStatus(200);
        }).catch(next)
      }).catch(next);
    }).catch(next);
  }).catch(next);
});

router.put('/removeParent', function(req, res, next) {
  authutils.ensure_group(req.get('token'), 1).then(function() {
    removeParent(req.body.child).then(function() {res.sendStatus(200)}).catch(next);
  }).catch(next);
})

router.get('/usersInUnit/:id', function(req, res, next) {
  authutils.ensure_group(req.get('token'), 1).then(function() {
    User.find({unit: req.params.id}).then(function(users) {
      res.json(users.map(function(user) {
        return user.id;
      }));
    }).catch(next);
  }).catch(next);
})

router.get('/freeUsers', function(req, res, next) {
  authutils.ensure_group(req.get('token'), 1).then(function() {
    User.find({unit: undefined}).then(function(users) {
      res.json(users.map(function(user) {
        return user.id;
      }));
    }).catch(next);
  }).catch(next);
})

router.put('/relateUser', function(req, res, next) {
  var userID = req.body.user;
  var unitID = req.body.unit;
  authutils.ensure_group(req.get('token'), 1).then(function() {
    User.findById(userID).then(function(user) {
      if (!user.unit) {
        user.update({
          unit: unitID
        }).then(function(user) {
          res.sendStatus(200);
        })
      }
    })
  })
})

router.put('/removeUser', function(req, res, next) {
  var userID = req.body.user;

  authutils.ensure_group(req.get('token'), 1).then(function() {
    User.findById(userID).then(function(user) {
      if (user.unit) {
        var unitID = user.unit;
        Unit.findById(unitID).then(function(unit) {
          if (unit.manager != userID && unit.docsControl != userID && unit.agents.indexOf(userID) < 0) {
            user.update({
              unit: undefined
            }).then(function() {
              res.sendStatus(200);
            }).catch(next);
          } else {
            next(new Error('請先移除該使用者在該單位的職位。'));
          }
        }).catch(next);
      } else {
        next(new Error('該使用者並未隸屬任何單位。'));
      }
    }).catch(next);
  })
})

router.put('/assignRole', function(req, res, next) {
  var userID = req.body.user;
  var unitID = req.body.unit;
  var role   = req.body.role;

  authutils.ensure_group(req.get('token'), 1).then(function() {
    User.findById(userID).then(user => {
      if (user.unit != unitID) {
        next(new Error('該使用者並非於該單位任職。'))
      } else {
        Unit.findById(unitID).then(unit => {
          if (role == 'manager') {
            if (unit.manager) {
              next(new Error('該職位已經有人任職。'));
            } else {
              unit.update({manager: userID}).then(() => res.sendStatus(200)).error(next);
            }
          } else if (role == 'docsControl') {
            if (unit.docsControl) {
              next(new Error('該職位已經有人任職。'));
            } else {
              unit.update({docsControl: userID}).then(() => res.sendStatus(200)).error(next);
            }
          } else if (role == 'agent') {
            if (unit.agents.indexOf(userID) >= 0) {
              next(new Error('該人員已經任職此職位。'));
            } else {
              unit.agents.push(userID);
              unit.save().then(() => res.sendStatus(200)).error(next);
            }
          }
        })
      }
    })
  })
})

router.put('/deassignRole', function(req, res, next) {
  var userID = req.body.user;
  var unitID = req.body.unit;
  var role   = req.body.role;

  authutils.ensure_group(req.get('token'), 1).then(function() {
    Unit.findById(unitID).then(unit => {
      if (role == 'manager') {
        if (unit.manager != userID) {
          next(new Error('該職位並非由此人員任職。'));
        } else {
          unit.update({manager: undefined}).then(() => res.sendStatus(200)).error(next);
        }
      } else if (role == 'docsControl') {
        if (unit.docsControl != userID) {
          next(new Error('該職位並非由此人員任職。'));
        } else {
          unit.update({docsControl: undefined}).then(() => res.sendStatus(200)).error(next);
        }
      } else if (role == 'agent') {
        if (unit.agents.indexOf(userID) < 0) {
          next(new Error('該職位並非由此人員任職。'));
        } else {
          unit.update({
            $pull: {
              agents: userID
            }
          }).then(() => res.sendStatus(200)).error(next);
        }
      }
    })
  })
})

router.get('/:id', function(req, res, next) {
  authutils.ensure_group(req.get('token'), 1).then(function() {
      Unit.findById(req.params.id).then(function(unit) {
          res.json(unit);
      }).catch(next);
  }).catch(next);
});

router.put('/:id', function(req, res, next) {
    // These attributes should only be updated through methods below.
    req.body.parentUnit = undefined;
    req.body.childUnits = undefined;
    req.body.manager = undefined;
    req.body.docsControl = undefined;
    req.body.agents = undefined;

    authutils.ensure_group(req.get('token'), 1).then(function() {

        Unit.findByIdAndUpdate(req.params.id, {
            $set: {
              name: req.body.name,
              identifier: req.body.identifier
            }
        }, {
            "new": true
        }).then(function(doc) {
            res.sendStatus(200);
        }).catch(next);
    }).catch(next);
});

router.delete('/:id', function(req, res, next) {
  authutils.ensure_group(req.get('token'), 1).then(function() {
    Unit.findById(req.params.id).then(unit => {
      if (unit.parentUnit | unit.childUnits.length > 0) {
        next(new Error('該單位有母單位或是子單位不能刪除！'))
      } else {
        Unit.findByIdAndRemove(req.params.id, {
            $set: req.body
        }).then(function(doc) {
            res.sendStatus(200);
        }).catch(next)
      }
    }).catch(next)
  }).catch(next)
});

function removeParent(childID) {
  return new Promise(function(resolve, reject) {
    Unit.findById(childID).then(function(child) {
      if (child.parentUnit) {
        Unit.findByIdAndUpdate(child.parentUnit, {
          $pull: {
            childUnits: childID
          }
        }).then(function(newParent) {
          child.update({
            parentUnit: undefined
          }).then(function() {
            resolve()
          }).catch(reject);
        })
        .catch(reject);
      } else {
        resolve();
      }
    }).catch(reject);
  })
}


module.exports = router;
