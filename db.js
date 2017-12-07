const CREDS  = require('./creds');
const DB_URL = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo";

var mongoose = require('mongoose');
mongoose.connect(DB_URL);
