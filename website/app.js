var express = require('express');
var http = require('http');
var path = require('path');
var winston = require('winston');
var lastfm = require("lastfm");
var mongodb = require("mongodb");
var memjs = require("memjs");

var crypt = require("./common/Crypter");
var lfmDao = require("./LastFmDao");
var mngDao = require("./MongoDao");
var pages = require('./routes/pages');
var api = require('./routes/api');

// Required environment variables
var PORT = process.env.SA_PORT;
var NODE_ENV = process.env.NODE_ENV;
var BASE_URL = process.env.SA_BASE_URL;
var LASTFM_API_KEY = process.env.SA_LASTFM_API_KEY;
var LASTFM_SECRET = process.env.SA_LASTFM_SECRET;
var USER_CRYPTO_KEY = process.env.SA_USER_CRYPTO_KEY;
var STATION_CRYPTO_KEY = process.env.SA_STATION_CRYPTO_KEY;
var MONGO_URI = process.env.SA_MONGO_URI;
var ADMIN_USERNAME = process.env.SA_ADMIN_USERNAME;

if (!PORT || !NODE_ENV || !BASE_URL || !LASTFM_API_KEY || !USER_CRYPTO_KEY || !STATION_CRYPTO_KEY || !LASTFM_SECRET
	|| !MONGO_URI || !ADMIN_USERNAME) {
	winston.error("A required environment variable is missing:", process.env);
	process.exit(1);
}

var app = express();

// Configuration

// all environments
app.set('port', process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.favicon(path.join(__dirname, '/public/img/favicon.ico')));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

var winstonOpts = { timestamp: true }

// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
	winstonOpts['colorize'] = true;
	winstonOpts['level'] = 'info';
}

// production only
if (app.get('env') === 'production') {
	winstonOpts['colorize'] = false;
	winstonOpts['level'] = 'warn';
}

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, winstonOpts);

var userCrypter = new crypt.CrypterImpl(USER_CRYPTO_KEY);
var stationCrypter = new crypt.CrypterImpl(STATION_CRYPTO_KEY);

var lastfmNode = new lastfm.LastFmNode({
	api_key: LASTFM_API_KEY,
	secret: LASTFM_SECRET,
	useragent: 'scrobblealong/v0.0.1 ScrobbleAlong'
});

var lastfmDao = new lfmDao.LastFmDao(lastfmNode);

mongodb.connect(MONGO_URI, function (err, dbClient) {
	if (err) {
		winston.err("Error connecting to MongoDB:", err);
		process.exit(1);
	}

	var mongoDao = new mngDao.MongoDao(userCrypter, stationCrypter, dbClient);
	var cacheClient = memjs.Client.create();

	pages.init(userCrypter, lastfmDao, mongoDao);
	api.init(lastfmDao, mongoDao, cacheClient);

	// Routes

	app.get('/', pages.index);
	app.get('/about', pages.about);
	app.get('/admin', pages.admin);
	app.get('/login', pages.login);
	app.get('/logout', pages.logout);

	// JSON API
	app.get('/api/login-url', api.loginUrl);
	app.get('/api/user-details', api.userDetails);
	app.get('/api/stations', api.stations);
	app.get('/api/user-lastfm-info', api.userLastfmInfo);
	app.get('/api/station-lastfm-info', api.stationLastfmInfo);
	app.get('/api/station-lastfm-tasteometer', api.stationLastfmTasteometer);
	app.get('/api/station-lastfm-recenttracks', api.stationLastfmRecentTracks);

	app.post('/api/stop-scrobbling', api.stopScrobbling);
	app.post('/api/scrobble-along', api.scrobbleAlong);

	app.get('/api/admin/users', api.allUsers);
	app.get('/api/admin/stations', api.allStations);

	app.post('/api/admin/add-station', api.addStation);
	app.post('/api/admin/update-station', api.updateStation);
	app.post('/api/admin/clear-listening', api.clearUserListening);
	app.post('/api/admin/clear-session', api.clearUserSession);

	// Start Server
	http.createServer(app).listen(PORT, function () {
		winston.info('Express server listening on port ' + PORT);
	});
});

/*
todo
deploy & test - check logs on site and server
 - make 2 separate submodules, use git to deploy website submodule

time out scrobbling
*/