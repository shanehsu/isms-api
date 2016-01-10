var mongoose = require('mongoose');

var db_uri   = 'mongodb://isms:isms@ds053964.mongolab.com:53964/isms';

mongoose.connect(db_uri);

// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + db_uri);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./../models/form');
require('./../models/record');
require('./../models/piece');
require('./../models/unit');
require('./../models/user');

// Configure Mongoose to use native Promise
mongoose.Promise = global.Promise;

module.exports = mongoose;
