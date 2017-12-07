var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

var Event = require('./event');

// All events
router.get('/', function (req, res) {
  Event.find({}, function (err, events) {
    if (err) return res.status(500).send("Could not find events");
    return res.status(200).send(events);
  });
});


// Event by game type
router.get('/:game', function (req, res) {
  Event.find({ "game": req.params.game}, function (err, games) {
    if (err) return res.status(500).send("Could not find games");
    if (!games) return res.status(404).send("No games found");
    res.status(200).send(games);
  });
});

module.exports = router;


