/*
 * over.ggs scraper
 * Inserts ongoing overwatch tournaments into a mongodb instance
 */
// Setting up all the JS tools, configuration files, DB access
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
mongoose.Promise = global.Promise;
const Event = require('./models/event.js');
const CREDS = require('./creds');
const DB_URL = "mongodb://" + CREDS.username + ":" + CREDS.password + "@ds121456.mlab.com:21456/ecalo";
const config = require('./config');

// Main function that performs the scraping and inserting into the db
async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0
  });
  const page = await browser.newPage();
  await page.goto(config.OVERWATCH_URL, {
    waitUntil: 'networkidle2'
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  // Scraper function that locates the exact html containers with the event information
  let details = $('#content > div:nth-child(2)').find('a.wf-card.event-card').map(function(inx, thisRow){
    return [$(thisRow).text().replace(/\t/g,'').split('\n')];
    }).get().map(x => x.filter(Boolean));

  // Formats the information scraped into the db schema 'Event'
  details.map(function(d) {
    dates = fixDate([d[3],d[4]])
    upsert({
      'name': d[0],
      'startDate':dates[0],
      'endDate':dates[1],
      'game':'Overwatch',
      'location': d[2]
    });
  });

  await browser.close();
};

// Formats over.gg's format for dates into Date objects
function fixDate(dateRange) {
  return dateRange.map(function(n) {
    let dateInfo = n.split(' ');
    let month = config.months[dateInfo[0].slice(0,3).toLowerCase()];
    let day = dateInfo[1].replace(/[^0-9]+/g, '');
    let year = (dateInfo.length > 2) ? dateInfo[2] : new Date().getFullYear();
    return new Date(year, month, day);
  });
}

// Insert or update events into db via mongoose
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
