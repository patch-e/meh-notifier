/*
utils.js
Module that provides utility functions to mccrager nodejs apps

Copyright (c) 2014

Patrick Crager

*/

module.exports = {
	addlRegEx: /\(([^()]+)\)$/,

	// type safe trim function
	// returns a trimmed string with continous spaces replaced with a single space
	trim: function(s) {
		// only invoke trim() if a string was passed in
		if (typeof s === 'string') { 
			s = s.trim().replace('\n', '').replace('\t', '').replace(/\s+/g,' ');
		}
		return s;
	},

	// parses the "ABV" text to return a floating point value
	parseABV: function(s) {
		if ( typeof s === 'string' ) { 
			s = s.replace('ABV:', '').replace(' ', '').replace('%', '');
		}
		return parseFloat(s);
	},

	// parses the "last updated" text to remove the prefix label
	parseLastUpdated: function(s) {
		if ( (typeof s === 'string') && (s.lastIndexOf('Last Update:', 0) === 0) ) { 
			s = s.replace('Last Update:', '').replace(' ', '');
		}
		return s;
	},

	// parses the "title" text to remove any beer prefixes
	parseTitle: function(s) {
		if ( (typeof s === 'string') && (s.lastIndexOf('Beers', 0) === 0) ) { 
			s = s.replace('Beers', '').replace(' ', '');
		}
		return s;
	},

	// parses the name text to extract "additional" text in parens
	parseAdditional: function(s) {
		s = s.match(this.addlRegEx) || [''];
		return s[0].replace('(', '').replace(')', '');
	},

	// parses the name text to remove "additional" text in parens
	parseName: function(s) {
		return s.replace(this.addlRegEx, '');
	},

	// maps values to properties of the beer object depending on index
	mapBeerValues: function(index, value, beer) {
		switch(index) {
			case 0:
				beer.number = parseInt(value, 10);
				break;
			case 1:
				beer.brewery = value;
				break;
			case 2:
				beer.name = this.parseName(value);
				beer.addl = this.parseAdditional(value);
				break;
			case 3:
				beer.style = value;
				break;
			case 4:
				beer.abv = this.parseABV(value);
				break;
			case 5:
				beer.growlerable = (value === 'Yes' ? true : false);
				break;
		}
	}
};
