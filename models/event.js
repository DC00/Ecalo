const mongoose = require('mongoose');

let eventSchema = new mongoose.Schema({
	title: String,
	start: Date,
	end: Date,
	game: String,
	location: String
});

let Event = mongoose.model('Event', eventSchema);

module.exports = Event;
