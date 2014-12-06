/*
meh.js
Send an email notification of the current meh.com deal

Copyright (c) 2014

Patrick Crager

*/

var http = require('http'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    cheerio = require('cheerio'),
    console = require('clim')('meh'),
    later = require('later'),
    utils = require('./utils'),
    mehFileName = 'currentMeh.json';

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

var saveMeh = function(meh) {
    fs.writeFile(mehFileName, JSON.stringify(meh), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("meh saved to " + mehFileName);
        }
    }); 
}

var fetchAndNotify = function() {
  request('http://meh.com', function (error, response, html) {
    if (!error && response.statusCode === 200) {
      // load meh html
      var $ = cheerio.load(html);
      // special meh parsing
      var buyButton = $('#hero-buttons button.buy-button');
      var photos = $('#gallery .photos img').each(function(index, img) {
        var $img = $(img);
        var src = $img.attr('data-src');
        $img.attr('src', src);
      });
      // populate subject/body with pieces from the deal listing
      var subject = $('section.features h2').text(),
          body  = '<div><a href="' + buyButton.attr('href') + '">' + buyButton.text() + '</a></div>';
          body += '<div>' + $('#price-check').html() + '</div>';
          body += '<div>' + $('section.features').html() + '</div>';
          body += '<div>' + $('section.story').html() + '</div>';
          body += '<div>' + photos + '</div>';

      // populate mail with meh deal
      mailOptions.subject = 'meh - ' + utils.trim(subject);
      mailOptions.html = utils.trim(body);
    } else {
      // error logging
      console.error('error - meh remote status code' + response.statusCode);
      console.error(error);

      // populate mail with error
      mailOptions.subject = 'meh - error';
      mailOptions.text = 'Failed to contact meh for notification: HTTP ' + response.statusCode;
    }

    // send the mail
    sendMail();

    // capture and persist the current meh
    var currentMeh = mailOptions;
    currentMeh.to = '[redacted]';
    saveMeh(currentMeh);
  });
};

// setup the schedule
later.date.localTime();
var schedule = later.parse.text('at 00:15 am'),
    timer = later.setInterval(fetchAndNotify, schedule);

// handles incoming requests to the server
var _requestHandler = function(request, response) {
  var occurrences = later.schedule(schedule);

  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('waiting...\n');
  response.write('next notification at: ' + occurrences.next(1, new Date()));
  response.write('\n\nmost recent meh notification:\n');
  
  fs.readFile(mehFileName, {encoding: 'utf-8'}, function (error, data) {
    if (!error) {
      // parse the file data to a JSON object then pretty print it to the response
      var jsonString = JSON.parse(data);
      response.write(JSON.stringify(jsonString, null, 4));
    } else {
      response.write('failed to read ' + mehFileName + '!');
    }
    // end the response in the callback
    response.end();
  });  
};

// fire up the status server
var server = http.createServer().addListener('request', _requestHandler).listen(process.env.PORT);