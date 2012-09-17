exports.get = {};
exports.post = {};
exports.all = {};

// You can either edit this route here, or overwrite it in any other file.
// GET /
exports.get['/'] = function index(req, res) {
    var data = {
            user:req.user
        };
    
    res.render('index.dot', data);
};

var fs = require('fs'),
    files = fs.readdirSync('./routes/'),
    mapToObject = require('../tools').mapToObject;

files.forEach(function(file) {
    if( file === 'index.js') return;
    
    var routes = require('./'+file);
    
    mapToObject(routes, exports);
});