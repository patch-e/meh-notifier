/*
utils.js
Module that provides utility functions to meh.js

Copyright (c) 2014

Patrick Crager

*/

module.exports = {
	// type safe trim function
	// returns a trimmed string with continous spaces replaced with a single space
	trim: function(s) {
		// only invoke trim() if a string was passed in
		if (typeof s === 'string') { 
			s = s.trim().replace('\n', '').replace('\t', '').replace(/\s+/g,' ');
		}
		return s;
	}
};