var winston = require('winston');

var crypter = null;
var lastfmDao = null;
var mongoDao = null;

exports.init = function(crypt, lfm, mng) {
	crypter = crypt;
	lastfmDao = lfm;
	mongoDao = mng;
};

exports.index = function(req, res) {
	// if session is set in the cookie, make sure we can still
	res.render('index');
};

exports.admin = function(req, res) {
	res.render('admin');
};

exports.login = function(req, res) {
	var token = req.query['token'];
	if (!token) {
		winston.error("Token was not found during login");
		//todo send message to user?
		res.redirect("/");
		return;
	}

	lastfmDao.getSession(token, function(err, session) {
		if (err || !session) {
			winston.error("Error getting session:", err);
			//todo send message to user?
			res.redirect("/");
			return;
		}

		var encrpytedSession = crypter.encrypt(session.key);
		winston.info("User " + session.user + " logging in with encrypted session:", encrpytedSession);
		mongoDao.storeUserSession(session.user, encrpytedSession, function(err) {
			if (err) {
				winston.error("Error storing user session:", err);
				//todo send message to user?
			}
			else {
				res.cookie('lastfmSession', encrpytedSession, { maxAge: 365*24*60*60*1000 }); // max age = 1 year
				winston.info("Successfully stored session for user " + session.user)
			}
			res.redirect("/"); //todo disable 304?
		});
	});
};

exports.logout = function(req, res) {
	if (req.cookies['lastfmSession']) {
		if (!('keep-scrobbling' in req.query)) {
			/*
			env.updater.removeListener(encryptedSession,
				() => { },  //todo? env.db.clearUserSession(encryptedSession, () => { }, () => { });?
				() => { }); //todo?
			*/
		}
		res.clearCookie('lastfmSession');
	}
	res.redirect("/");
};