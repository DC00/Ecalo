var express = require('express'),
    config  = require('./config'),
    path    = require('path'),
    port    = process.env.PORT || config.PORT,
    app     = require('./app');

const CREDS = require('./creds');
const DB_URL  = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo"

// Listen on env port or set port 3000
var server = app.listen(port, function() {
  console.log("ecalo magic on port ", config.PORT);
})
