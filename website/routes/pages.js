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
	res.render('index');
};

exports.about = function(req, res) {
	res.render('about');
};

exports.admin = function(req, res) {
	var encryptedSession = req.cookies['lastfmSession'];
	if (!encryptedSession) {
		winston.warn("Admin attempt with no session");
		res.redirect("/");
		return;
	}

	mongoDao.getUserData(encryptedSession, function(err, userData) {
		if (err || !userData) {
			winston.error("Error getting user data for admin:", err);
			res.redirect("/");
			return;
		}

		if (userData['_id'] != process.env.SA_ADMIN_USERNAME) {
			winston.warn("Admin attempt from non-admin");
			res.redirect("/");
		}
		else {
			res.render('admin');
		}
	});
};

exports.login = function(req, res) {
	var token = req.query['token'];
	if (!token) {
		winston.error("Token was not found during login");
		res.redirect("/");
		return;
	}

	lastfmDao.getSession(token, function(err, session) {
		if (err || !session) {
			winston.error("Error getting session:", err);
			res.redirect("/");
			return;
		}

		var encrpytedSession = crypter.encrypt(session.key);
		winston.info("User " + session.user + " logging in with encrypted session:", encrpytedSession);
		mongoDao.storeUserSession(session.user, encrpytedSession, function(err) {
			if (err) {
				winston.error("Error storing user session:", err);
			}
			else {
				res.cookie('lastfmSession', encrpytedSession, { maxAge: 30*24*60*60*1000 }); // max age = 30 days
				winston.info("Successfully stored session for user " + session.user)
			}
			res.redirect("/");
		});
	});
};

exports.logout = function(req, res) {
	var encryptedSession = req.cookies['lastfmSession'];
	if (!encryptedSession) {
		winston.warn("Logout attempt with no session");
		res.redirect("/");
		return;
	}

	res.clearCookie('lastfmSession');

	if ('keep-scrobbling' in req.query) {
		res.redirect("/");
		return;
	}

	mongoDao.getUserData(encryptedSession, function(err, userData) {
		if (err || !userData || !userData['_id']) {
			winston.error("Error getting user data on logout:", err);
			res.redirect("/");
			return;
		}

		mongoDao.setUserScrobbling(userData['_id'], null, function(err, status) {
			if (err) {
				winston.error("Error clearing user scrobble station:", err);
			}
			res.redirect("/");
		});
	});
};