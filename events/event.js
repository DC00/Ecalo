const mongoose = require('mongoose');

let eventSchema = new mongoose.Schema({
	name: String,
	startDate: Date,
	endDate: Date,
	game: String,
	location: String
});

let Event = mongoose.model('Event', eventSchema);

module.exports = Event;
