/*
 * over.ggs scraper
 * Inserts ongoing overwatch tournaments into a mongodb instance
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
  await page.goto(config.OVERWATCH_URL, {
    waitUntil: 'networkidle2'
  });

  //const EVENTS_TABLE = 'body > div.content > div > div > table:nth-child(6) > tbody';
  //const html = await page.content();
  //const $ = cheerio.load(html);

  //var details = $(EVENTS_TABLE).find('tr').map(function(inx, thisRow) {
    //return [$(thisRow).text().trim().split('\n').slice(0, 4)];
  //}).get();

  //details.map(function(d) {
    //dates = fixDate(d[1]);
    //upsert({
      //'name': d[0],
      //'startDate': dates[0],
      //'endDate': dates[1],
      //'game': d[2],
      //'location': d[3]
    //});
  //});

  const html = await page.content();
  const $ = cheerio.load(html);

  let details = $('#content > div:nth-child(2)').find('a.wf-card.event-card').map(function(inx, thisRow){
    return [$(thisRow).text().replace(/\t/g,'').split('\n')];
    }).get().map(x => x.filter(Boolean));

  //details.map(function(d) {
    //upsert({
      //'name': d[0],
      //'startDate':
      //'endDate':
      //'game':'Overwatch'
      //'location': d[2]
    //});
  }
  await browser.close();
};

// Fixing dates with Overwatch Events
function fixDate(dateRange) {
  return dateRange.map(function(n) {
    var dateInfo = n.split(' ');
    var month = config.months[dateInfo[0].slice(0,3).toLowerCase()];
    var day = dateInfo[1].replace(/[^0-9]+/g, '');
    var year = (dateInfo.length > 2) ? dateInfo[2] : new Date().getFullYear();
    return new Date(month, day, year);
  }
}

// Insert or update events
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
