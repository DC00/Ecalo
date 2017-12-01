/*
 * r/smashbros scraper
 * Inserts upcoming smash tournaments into a mongodb instance
 * puppeteer api: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
mongoose.Promise = global.Promise;
const Event = require('./models/event.js');
const CREDS = require('./creds');
const DB_URL = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo";
const config = require('./config');

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0
  });
  const page = await browser.newPage();
  await page.goto(config.REDDIT_URL, {
    waitUntil: 'networkidle2'
  });

  const EVENTS_TABLE = 'body > div.content > div > div > table:nth-child(6) > tbody';
  const html = await page.content();
  const $ = cheerio.load(html);

  var details = $(EVENTS_TABLE).find('tr').map(function(inx, thisRow) {
    return [$(thisRow).text().trim().split('\n').slice(0, 4)];
  }).get();

  details.map(function(d) {
    dates = fixDate(d[1]);
    upsert({
      'name': d[0],
      'startDate': dates[0],
      'endDate': dates[1],
      'game': d[2],
      'location': d[3]
    });
  });

  await browser.close();
};

// converts datestring to Date object. Optional pretty format commented out
function fixDate(date) {
  var dateinfo = date.split(' ');
  var year = new Date().getFullYear();
  var month = config.months[dateinfo[0].slice(0, 3).toLowerCase()];
  var day = dateinfo[1];
  var startDate = new Date(year, month, day);
  var endDate;
  if (startDate.getTime() < new Date().getTime()) {
    startDate.setFullYear(year + 1);
  }
  if (dateinfo.length > 2) {
    endDate = new Date(year, month, dateinfo[3])
  }

  return [startDate, endDate];

  // prettyStart = dateFormat(startDate, "dddd, mmmm dS, yyyy");
  // prettyEnd = dateFormat(endDate, "dddd, mmmm dS, yyyy");
  // return [prettyStart, prettyEnd];

}

// insert or update events
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
