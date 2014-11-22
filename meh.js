/*
meh.js
Send an email notification of the current meh.com deal

Copyright (c) 2014

Patrick Crager

*/

var http = require('http'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    cheerio = require('cheerio'),
    console = require('clim')('meh'),
    later = require('later'),
    utils = require('./utils');

// create transporter with SMTP credentials
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.smtpUser,
        pass: process.env.smtpPassword
    }
});

// create e-mail message
var mailOptions = {
    from: process.env.mehFrom,
    to: process.env.mehTo
};

// send mail
var sendMail = function() {
  transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
          console.log(error);
      } else {
          console.log('Message sent: ' + info.response);
      }
  });
};

var currentMeh = {};
var fetchAndNotify = function() {
  request('http://meh.com', function (error, response, html) {
    if (!error && response.statusCode === 200) {
      // meh parsing
      var $ = cheerio.load(html);
      var buyButton = $('div#hero-buttons button.buy-button');
      var subject = $('section.features h2').text(),
          body  = '<div><a href="' + buyButton.attr('href') + '">' + buyButton.text() + '</a></div>';
          body += $('div#price-check').html();
          body += $('section.features').html();
          body += $('section.story').html();

      // populate mail with meh deal
      mailOptions.subject = 'meh - ' + utils.trim(subject);
      mailOptions.html = utils.trim(body);
    } else {
      // error logging
      console.error('status code' + response.statusCode);
      console.error(error);

      // populate mail with error
      mailOptions.subject = 'meh - error';
      mailOptions.text = 'Failed to parse meh for notification: HTTP ' + response.statusCode;
    }

    // send the mail
    sendMail();

    // capture the current meh in an object
    currentMeh = mailOptions;
    currentMeh.to = '[redacted]';
  });
}();

// setup the schedule
later.date.localTime();
var schedule = later.parse.text('at 12:15am'),
    timer = later.setInterval(fetchAndNotify, schedule),
    occurrences = later.schedule(schedule);

// handles incoming requests to the server
var _requestHandler = function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('waiting...\n');
  response.write('next notification at: ' + occurrences.next(1, new Date()));
  response.write('\n\nmost recent meh notification:\n');
  response.write(JSON.stringify(currentMeh, null, 4));
  response.end();
};

// fire up the status server
var server = http.createServer().addListener('request', _requestHandler).listen(process.env.PORT);