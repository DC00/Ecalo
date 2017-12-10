var express = require('express');
var app = express();
var path = require('path');
var db = require('./db');

var EventController = require('./events/EventController');

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, './ecalo/build')));

app.use('/api', EventController);

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './ecalo/build', 'index.html'));
});

module.exports = app;
