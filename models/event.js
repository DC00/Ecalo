const mongoose = require('mongoose');

let eventSchema = new mongoose.Schema({
	eventName: String,
	// yyyy-mm-dd
	date: Date,
	game: String,
	location: String
});

let Event = mongoose.model('Event', eventSchema);

module.exports = Event;
