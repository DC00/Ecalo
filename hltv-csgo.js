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

	//div containing each month of events
	const EVENTS_DIV = 'body > div.bgPadding > div > div.colCon > div.contentCol > div > div.events-holder';

	//selector to access each monthly div
	const LENGTH_SELECTOR_CLASS = 'div.events-month';

	//count how many div.events-month are within div.events-holder
	let listLength = await page.evaluate((sel) => {
		return document.getElementsByClassName(sel).length;
	}, LENGTH_SELECTOR_CLASS)

	//iterate through each div.events-month, 
	
}