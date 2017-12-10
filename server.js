const express = require('express'),
      config  = require('./config'),
      port    = process.env.PORT || config.PORT,
      path    = require('path');
      Event   = require('./events/event');
      EventController = require('./events/EventController');
      app     = express();
      mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, './ecalo/build')));

app.use('/api/events', EventController);

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './ecalo/build', 'index.html'));
});

app.listen(port, function() {
  console.log("ecalo magic on port", config.PORT);
})
