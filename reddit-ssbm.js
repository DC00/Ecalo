/* 
 * r/smashbros scraper
 * Inserts upcoming smash tournaments into a mongodb instance
 * puppeteer api: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongo = require('mongodb').MongoClient;
const CREDS = require('./creds');
const URL = "https://www.reddit.com/r/smashbros/wiki/events"
const DB_URL = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo"

async function run(){
  const browser = await puppeteer.launch({
		headless: true,
		slowMo: 0
	});
  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: 'networkidle2'});

	const EVENTS_TABLE = 'body > div.content > div > div > table:nth-child(6) > tbody';
	const html = await page.content();	
	const $ = cheerio.load(html);

	var details = $(EVENTS_TABLE).find('tr').map(function(inx, thisRow) {
		return [$(thisRow).text().trim().split('\n').slice(0,4)];
	}).get();
//	console.log(details);

	details.map(function(d) {
		upsert({
			'eventName': d[0],
			'date': d[1],
			'game': d[2],
		  'location': d[3]
		});
	});

  await browser.close();
};

function upsert(data) {
	mongoose.connection.on("connected", function(ref) {
		console.log("connected");
	});

	mongoose.connection.on("error", function(err) {
		console.log(err);
	});

	mongoose.connection.on("disconnected", function() {
		console.log("disconnected");
	});

	var gracefulExit = function() {
		mongoose.connection.close(function () {
			console.log("disconnected from node termination");
			process.exit(0);
		});
	}

	process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

	try {
		// options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1 };
		mongoose.connect(DB_URL);
		console.log("Trying to connect to DB");
	} catch (err) {
		console.log("Sever initialization failed " , err.message);
	}
}

run();
