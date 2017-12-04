// hltv csgo scraper
// Inserts upcoming csgo tournaments into a mongodb instance
// puppeteer api: puppeteer api: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
// scraped site: https://www.hltv.org/events

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const date Format = require('dateFormat');
mongoose.Promise = global.Promise;
const Event = require('./models/event.js');
const CREDS = require('./creds');
const DB_URL = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo"
const config = require('./config');

async function run() {
	const browser = await puppeteer.launch({
		headless: true,
		slowMo: 0
	});

	const page = await browser.newPage();
	await page.goto(config.HLTV_URL, {
		waiUntil: 'networkidle2'
	});

	const html = await page.content();
	const $ = cheerio.load(html);

	//div containing each month of events
	const EVENTS_DIV = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder';

	//selector to access each month
	const LENGTH_SELECTOR_CLASS = 'div.events-holder div.events-month';
	const EVENTS_MONTH_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(INDEX)';
	const EVENT_NAME_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(1) > div.big-events > a:nth-child(INDEX) > div.big-event-info > div.info > div';
	const EVENT_STARTDATE_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(INDEX) > div.big-events > a:nth-child(1) > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(1)';
	const EVENT_ENDDATE_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(INDEX) > div.big-events > a:nth-child(1) > div.big-event-info > div.additional-info > table > tbody > tr:nth-child(1) > td.col-value.col-date > span:nth-child(2) > span';
	const EVENT_YEAR_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(INDEX) > div.standard-headline';
	const EVENT_LOCATION_SELECTOR = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder > div:nth-child(INDEX) > div.big-events > a:nth-child(2) > div.big-event-info > div.info > div.location-top-teams > div:nth-child(1) > span';


	//count how many div.events-month there are
	let listLength = await page.evaluate((sel) => {
		return document.getElementsByClassName(sel).length;
	}, LENGTH_SELECTOR_CLASS)

	//iterate through each div.events-month
	for (let i = 1; i <= listLength; i++) {
		//selectors with index replaced
		let eventsMonthSelector = EVENTS_MONTH_SELECTOR.replace("INDEX", i);
		let eventNameSelector = EVENT_NAME_SELECTOR.replace("INDEX", i);
		let eventStartDateSelector = EVENT_STARTDATE_SELECTOR.replace("INDEX", i);
		let eventEndDateSelector = EVENT_ENDDATE_SELECTOR.replace("INDEX", i);
		let eventYearSelector = EVENT_YEAR_SELECTOR.replace("INDEX", i);
		let eventLocationSelector = EVENT_LOCATION_SELECTOR.replace("INDEX", i);

		let eventName = await page.evaluate((sel) => {
			let element = document.querySelector(sel);
			return element? element.innerHTML: null;
		}, eventNameSelector);

		let eventStartDate = await page.evaluate((sel) => {
			let element = document.querySelector(sel);
			return element? element.innerHTML: null;
		}, eventStartDateSelector);

		let eventEndDate = await page.evaluate((sel) => {
			let element = document.querySelector(sel);
			return element? element.innerHTML: null;
		}, eventEndDateSelector);

		let eventYear = await page.evaluate((sel) => {
			let element = document.querySelector(sel);
			return element? element.innerHTML: null;
		}, eventYearSelector);

		let eventLocation = await page.evaluate((sel) => {
			let element = document.querySelector(sel);
			return element? element.innerHTML: null;
		}, eventLocationSelector);

		eventStartDate = fixDate(eventStartDate, eventYear);
		eventEndDate = fixDate(eventEndDate, eventYear);

		let game = 'CSGO';

		let details = [eventName, eventStartDate, eventEndDate, game, eventLocation];

		//create a mapfrom details and upsert it
		details.map(function(d) {
			dates = fixDate(d[1]);
			upsert({
				'name': d[0],
				'startDate': d[1],
				'endDate': d[2],
				'game': d[3],
				'location': d[4]
			});
		});
	}
}

	await browser.close();


	function fixDate(date, year) {

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