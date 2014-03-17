scrobble-along
==============

This is a set of scripts that figures out what's playing on a number of internet and wireless radio stations and scrobbles that information to some [last.fm](http://last.fm/) accounts. It also has a front-end website that allows people to also scrobble what the radio stations are scrobbling. I'm in the process of re-writing it and right now only the scrobbling part is done, the front-end has not yet been re-written. The site should be up and running [here](http://scrobblealong.com).

The scrobbler script requires a few environment variables:
* SA_STATION_CRYPTO_KEY: A random string used to encrypt the sessions of the radio station last.fm accounts
* SA_USER_CRYPTO_KEY: A random string used to encrypt the sessions of the radio station last.fm accounts
* SA_MONGO_URI: The URI of the MongoDB database that contains the user and station data
* SA_LASTFM_API_KEY: The Last.fm API key used for scrobbling
* SA_LASTFM_SECRET: The Last.fm API secret used for scrobbling
* SA_SHOULD_SCROBBLE: "true" if the script should actually post scrobbles, anything else if not