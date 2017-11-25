/* 
 * r/smashbros scraper
 * Inserts upcoming smash tournaments into a mongodb instance
 * puppeteer api: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongo = require('mongoose');
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
			'event': d[0],
			'date': d[1],
			'game': d[2],
		  'location': d[3]
		});
	});

  await browser.close();
};

function upsert(data) {
	console.log(DB_URL);			
};

run();
