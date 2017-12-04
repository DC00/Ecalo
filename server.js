var express = require('express'),
    config  = require('./config'),
    fs      = require('fs'),
    path    = require('path'),
    app     = express();

var router = express.Router();

// Routes
router.get('/', function (req, res) {
  res.json({message: 'welcome to ecalo'});
})

app.use('/api', router);


// Listen on env port or set port 3000
app.listen(process.env.PORT || config.PORT, function() {
  console.log("ecalo magic on port ", config.PORT);
})
