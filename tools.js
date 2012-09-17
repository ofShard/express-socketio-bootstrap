var crypto = require('crypto');

/**
 * Randomly generates a string of the specified length.
 * 
 * @param {Integer} len How long a string to generate.
 * @param {String} [pool='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] Characters to draw the random string from.
 * @returns {String} The uid.
 */
exports.uid = function uid(len, pool) {
    var S = pool || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        str = '';
	
	for( var i=0; i<len; i++ ) {
		str += S[randInt(0, S.length-1)];
	}
	
	return str;
};

exports.randInt = randInt;
function randInt(min, max) {
	try {
		var int = crypto.randomBytes(4).readUInt32LE(0);
		
		return min + (int % (max-min+1));
	}
	catch(e) {
		return Math.floor(min + (Math.random()*(min-max+1)));
	}
}

exports.mapToApp = function mapToApp(routes, app) {
    var method, route;

    for( method in routes ) {
        for( route in routes[method] ) {
            app[method](route, routes[method][route]);
        }
    }
};

exports.mapToObject = function mapToObject(routes, object) {
    var method, route;
    
    for( method in routes ) {
        for( route in routes[method] ) {
            object[method][route] = routes[method][route];
        }
    }
}

/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
exports.parseCookie = function parseCookie(str){
    var obj = {}
		, pairs = str.split(/[;,] */);
	for (var i = 0, len = pairs.length; i < len; ++i) {
		var pair = pairs[i]
			, eqlIndex = pair.indexOf('=')
			, key = pair.substr(0, eqlIndex).trim()
			, val = pair.substr(++eqlIndex, pair.length).trim();

		// quoted values
		if ('"' == val[0]) val = val.slice(1, -1);

		// only assign once
		if (undefined == obj[key]) {
			val = val.replace(/\+/g, ' ');
			try {
				obj[key] = decodeURIComponent(val);
			} catch (err) {
				if (err instanceof URIError) {
					obj[key] = val;
				} else {
					throw err;
				}
			}
		}
	}
	return obj;
};