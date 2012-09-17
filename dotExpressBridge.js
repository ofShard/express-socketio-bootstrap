var dot = require('dot')
  , fs = require('fs');

exports.__express = dotExpressBridge;
var cache = exports.cache = {};

function dotExpressBridge(path, options, callback) {
    if( typeof options === 'function' ) {
        callback = options;
        options = {};
    }
    
    if( cache[path] ) {
        try {
            return callback(null, cache[path](options));
        }
        catch(err) {
            return callback(err);
        }
    }
    else {
        fs.readFile(path, 'utf8', function(err, str) {
            try {
                cache[path] = dot.compile(str);
                
                return callback(null, cache[path](options));
            }
            catch(err) {
                return callback(err);
            }
        });
    }
}

dot.__express = exports.__express;