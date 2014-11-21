/*
meh.js
Send an email notification of the current meh.com deal

Copyright (c) 2014

Patrick Crager

*/

var nodemailer = require('nodemailer'),
    request = require('request'),
		cheerio = require('cheerio'),
		console = require('clim')(),
    utils = require('./utils');

request('http://meh.com', function (error, response, html) {
	if (!error && response.statusCode === 200) {
    // meh parsing
		var $ = cheerio.load(html);
    var buyButton = $('div#hero-buttons button.buy-button');
    var subject = $('section.features h2').text(),
        body  = $('div#price-check').html();
        body += '<div><a href="' + buyButton.attr('href') + '">' + utils.trim(buyButton.text()) + '</a></div>';
        body += $('section.features').html();
        body += $('section.story').html();

    // create e-mail message
    var mailOptions = {
        from: 'meh-notifier-bot <noreply@meh.com>',
        to: '?@gmail.com',
        subject: 'meh - ' + utils.trim(subject),
        html: body
    };    

    // create transporter with SMTP credentials
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '?',
            pass: '?'
        }
    });

    // send mail
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
	} else {
		// error logging
		console.error('status code' + response.statusCode);
		console.error(error);
	}
});