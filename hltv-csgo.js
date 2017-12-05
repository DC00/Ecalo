// hltv csgo scraper
// Inserts upcoming csgo tournaments into a mongodb instance
// puppeteer api: puppeteer api: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
// scraped site: https://www.hltv.org/events

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const dateFormat = require("dateFormat");
mongoose.Promise = global.Promise;
const Event = require("./models/event.js");
const CREDS = require("./creds");
const DB_URL =
	"mongodb://" +
	CREDS.username +
	":" +
	CREDS.password +
	"@ds121456.mlab.com:21456/ecalo";
const config = require("./config");

async function run() {
	const browser = await puppeteer.launch({
		headless: true,
		slowMo: 0
	});

	const page = await browser.newPage();
	await page.goto(config.HLTV_URL, {
		waiUntil: "networkidle2"
	});

	const html = await page.content();
	const $ = cheerio.load(html);

	//selector to access each month
	const LENGTH_SELECTOR_CLASS = "div.events-holder div.events-month";

	// how many months are displayed
	let listLength = await $(html).find(LENGTH_SELECTOR_CLASS).length;

	matchesInformation = [];

	//iterate through each div.events-month
	for (let m = 1; m <= listLength; m++) {
		//selectors with index replaced		
		let bigEventNameSelectorSuffix = ' > div.big-event-info > div.info > div.big-event-name';
		let bigEventLocationSelectorSuffix = ' > div.big-event-info > div.info > div.location-top-teams > div:nth-child(1) > span';
		let bigEventStartDateSelectorSuffix = ' > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(1)'
		let bigEventEndDateSelectorSuffix = ' > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(2)'

		let bigEventLength = $('div.big-events').children().length;
		let eventYearSelector = ('body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH) > div.standard-headline').replace("MONTH", m);

		let eventYear = $(eventYearSelector).text().replace(/[^0-9.]/g, "");
		

		for (let i = 1; i <= bigEventLength; i++) {
			// this can definitely be streamlined and I'll do that after being able to access small-event details
			let base = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH) > div.big-events > a:nth-child(BIGEVENT)'.replace("MONTH", m).replace("BIGEVENT", i);
			
			let bigEventName = $(base + bigEventNameSelectorSuffix).text().trim();
			bigEventName.length != 0 && console.log(bigEventName);

			let bigEventLocation = $(base + bigEventLocationSelectorSuffix).text().trim();
			//bigEventLocation.length != 0 && console.log(bigEventLocation);

			let bigEventStartDate = $(base + bigEventStartDateSelectorSuffix).text().trim().replace("th", "");
			//bigEventStartDate.length != 0 && console.log(bigEventStartDate);

			let bigEventEndDate = $(base + bigEventEndDateSelectorSuffix).text().trim().replace("- ","").replace("th","");
			//bigEventEndDate.length != 0 && console.log(bigEventEndDate);

		}

		let smallEventNameSelectorSuffix = '';
		let smallEventLocationSelectorSuffix = '';
		let smallEventStartDateSelectorSuffix = '';
		let smallEventEndDateSelectorSuffix = '';

		let smallEventSelector = ('body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH)').replace("MONTH", m);
		let smallEventLength = $(smallEventSelector).children('.small-event').length - 1;

		for (let j = 1; j <= smallEventLength; j++) {

		}

		// let game = 'CSGO';

		// let details = [eventName, eventStartDate, eventEndDate, game, eventLocation];
		// matchesInformation.push(details);
	}
	await browser.close();
}
//create a map from details and upsert it
// details.map(function(d) {
// 	dates = fixDate(d[1]);
// 	upsert({
// 		'name': d[0],
// 		'startDate': d[1],
// 		'endDate': d[2],
// 		'game': d[3],
// 		'location': d[4]
// 	});
// });

function fixDate(date, year) {}

// function upsert(eventObj) {
// 	if (mongoose.connection.readyState == 0) {
// 		mongoose.connect(DB_URL);
// 	}

// 	const conditions = {
// 		name: eventObj.name
// 	};
// 	const options = {
// 		upsert: true,
// 		new: true,
// 		setDefaultsOnInsert: true
// 	};

// 	Event.findOneAndUpdate(conditions, eventObj, options).exec()
// 		.then(function(result) {
// 			console.log("successfully inserted")
// 		})
// 		.catch(function(err) {
// 			console.log(err.message)
// 		});
// }

run();
