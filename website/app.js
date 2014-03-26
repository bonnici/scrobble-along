var express = require('express');
var http = require('http');
var path = require('path');
var winston = require('winston');

var pages = require('./routes/pages');
var api = require('./routes/api');

// Required environment variables
var PORT = process.env.PORT;
var NODE_ENV = process.env.NODE_ENV;

if (!PORT || !NODE_ENV) {
	winston.error("A required environment variable is missing:", process.env);
	process.exit(1);
}

var app = express();

// Configuration

// all environments
app.set('port', process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev')); //todo remove dev?
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
	// TODO
}


// Routes

app.get('/', pages.index);
app.get('/admin', pages.admin);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', pages.index);


// Start Server

http.createServer(app).listen(app.get('port'), function () {
	winston.info('Express server listening on port ' + app.get('port'));
});
