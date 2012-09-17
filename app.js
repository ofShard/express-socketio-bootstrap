var mongoose = require('mongoose'),
    express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    path = require('path'),
    tools = require('./tools'),
    sio;

app.configure(function(){
    require('./dotExpressBridge');
    
    app.set('port', process.env.PORT || 3000);
    app.set('dbpath', 'mongodb://cloud9:mdm01Master@alex.mongohq.com:10097/ofshardSandbox');
    app.set('views', path.join(__dirname, '/views'));
    app.set("view engine", "dot");
    
    var sessionKey = 'express.sid',
        sessionSecret = 'duPJiBWRdIYOgS6yXM1X',
        sessionStore = new express.session.MemoryStore()
    
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());  
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({
        key:sessionKey,
        secret:sessionSecret,
        store:sessionStore
    }));
    app.use(function(req, res, next) {
        req.sio = sio;
        next();
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    
    initSocketIo(server, sessionKey, sessionSecret, sessionStore);
});

var routes = require('./routes');

tools.mapToApp(routes, app);

initDatabase();

function initDatabase() {
    mongoose.connect(app.get('dbpath'));
    
    mongoose.connection.once('open', function() {
        initServer();
    });
    
    mongoose.connection.once('error', function(err) {
        console.log('Error connecting to database:');
        console.log(err, err.stack);
    });
}

function initServer() {
    server.listen(app.get('port'), function() {
        console.log('express listening on port', app.get('port'));
    });
}

function initSocketIo(server, sessionKey, sessionSecret, sessionStore) {
    var io = require('socket.io'),
        parseCookie = tools.parseCookie,
        Session = express.session.Session;

    sio = io.listen(server);

	sio.set('authorization', function(data, callback) {
		if( data.headers.cookie ) {
			data.cookie = parseCookie(data.headers.cookie);
			data.sessionID = data.cookie[sessionKey];

			sessionStore.get(data.sessionID, function(err, session) {
				if( err || !session ) {
					callback('Could not validate session.', false);
				} else {
					data.session = new Session(data.sessionID, session);
					callback(undefined, true);
				}
			})
		} else {
			callback('Could not validate session. No cookie transmitted.', false);
		}
	});

	sio.sockets.on('connection', function(socket) {
		var session = socket.handshake.session;

		var intervalID = setInterval(function() {
			session.reload(function() {
				session.touch().save();
			});
		}, 60*1000);

		socket.on('disconnect', function(){
			console.log('socket disconnected');

			clearInterval(intervalID);
		});
	});
}