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

	// how many months are displayed
	let listLength = await $(html).find("div.events-holder div.events-month").length;

	//iterate through each div.events-month
	for (let m = 1; m <= listLength; m++) {
		//selectors for specific information within event
		let eventNameSelector = ' > div.big-event-info > div.info > div.big-event-name';
		let eventLocationSelector = ' > div.big-event-info > div.info > div.location-top-teams > div:nth-child(1) > span';
		let eventStartDateSelector = ' > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(1)'
		let eventEndDateSelector = ' > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(2)'
		let eventYearSelector = ('body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH) > div.standard-headline').replace("MONTH", m);
		
		let eventLength = $(('body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH) > div.big-events').replace("MONTH", m)).children().length;
		let eventYear = $(eventYearSelector).text().replace(/[^0-9.]/g, "");
		
		for (let i = 1; i <= eventLength; i++) {
			let base = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(MONTH) > div.big-events > a:nth-child(EVENT)'.replace("MONTH", m).replace("EVENT", i);
		
			let eventName = $(base + eventNameSelector).text().trim();
			let eventLocation = $(base + eventLocationSelector).text().trim();
			let eventStartDate = $(base + eventStartDateSelector).text().trim().replace("th", "");
			let eventEndDate = $(base + eventEndDateSelector).text().trim().replace("- ","").replace("th","");
			
			let game = 'CSGO';

			let validEvent = eventName.length != 0 && eventLocation.length != 0 && eventStartDate.length != 0 && eventEndDate.length != 0;

			if  (validEvent) {
				let details =  [eventName, fixDate(eventStartDate, eventYear), fixDate(eventEndDate, eventYear), game, eventLocation];

			upsert({
				name: details[0],
				startDate: details[1],
				endDate: details[2],
				game: details[3],
				location: details[4]
			});
			}
		}
	}
	await browser.close();
}

function fixDate(date, year) {
	let day = ('0' + date.replace(/\D/g, '')).slice(-2);
	let month = ('0' + (config.months[date.slice(0, 3).toLowerCase()] + 1)).slice(-2);
	date = year + "-" + month + "-" + day + "T00:00:00.000Z";
	return date
}

function upsert(eventObj) {
	if (mongoose.connection.readyState == 0) {
		mongoose.connect(DB_URL);
	}

	const conditions = {
		name: eventObj.name
	};
	const options = {
		upsert: true,
		new: true,
		setDefaultsOnInsert: true
	};

	Event.findOneAndUpdate(conditions, eventObj, options).exec()
		.then(function(result) {
			console.log("successfully inserted")
		})
		.catch(function(err) {
			console.log(err.message)
		});
}

run();
