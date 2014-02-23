/// <reference path="../../definitions/DefinitelyTyped/jasmine/jasmine.d.ts"/>



var scrap = require("../scrapers/Scraper");
var scrob = require("../Scrobbler");
var lfmDao = require("../LastFmDao");

var nullSong = { Artist: null, Track: null };

describe("Scrobbler", function () {
    describe("scrapeAndScrobble", function () {
        var fetchAndParseSpy;
        var lastFmDao;
        var mockStation;
        var scrobbler;

        beforeEach(function () {
            var scraper = new scrap.DummyScraper("");
            fetchAndParseSpy = spyOn(scraper, 'fetchAndParse');

            lastFmDao = new lfmDao.DummyLastFmDao();
            spyOn(lastFmDao, 'postNowPlaying');
            spyOn(lastFmDao, 'scrobble');

            scrobbler = new scrob.Scrobbler({ MockScraper: scraper }, lastFmDao);

            mockStation = { ScraperName: "MockScraper", Session: "" };
        });

        it('should post now playing but not scrobble if a scrobbler finds a short song followed by a break', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 35 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(1);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(0);
        });

        it('should post now playing and scrobble if a scrobbler finds a long song followed by a break', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(2);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should post now playing and scrobble if a scrobbler finds a long song followed by another song', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            var song2 = { Artist: "TestArtist2", Track: "TestTrack2" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song2);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(3);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[2][0]).toEqual(song2);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should post now playing if single scrobbler finds a short song between two breaks', function () {
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(1);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(0);
        });

        it('should post now playing and scrobble if single scrobbler finds a long song between two breaks', function () {
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 52 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(2);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should post now playing for both songs if single scrobbler finds two short songs', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            var song2 = { Artist: "TestArtist2", Track: "TestTrack2" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song2);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(2);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song2);

            expect(lastFmDao.scrobble.callCount).toEqual(0);
        });

        it('should post now playing if an error is encountered after a short song', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(1);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(0);
        });

        it('should post now playing and not scrobble if many errors are encountered after a short song', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 35 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 50 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 76 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(2);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(0);
        });

        it('should post now playing and scrobble if many errors are encountered after a long song', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 50 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 75 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 98 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(3);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[2][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should not scrobble the same song twice in a row', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 50 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 65 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 100 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 115 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(5);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[2][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[3][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[4][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should not scrobble the same song twice in a row if an error occurs in the middle', function () {
            var song1 = { Artist: "TestArtist", Track: "TestTrack" };
            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 15 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 37 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb("Error", null);
            });
            scrobbler.scrapeAndScrobble([mockStation], 50 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 65 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, song1);
            });
            scrobbler.scrapeAndScrobble([mockStation], 100 * 1000);

            fetchAndParseSpy.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation], 115 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(5);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[2][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[3][0]).toEqual(song1);
            expect(lastFmDao.postNowPlaying.argsForCall[4][0]).toEqual(song1);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song1);
        });

        it('should post now playing and scrobble for multiple scrapers at the same time', function () {
            var scraper1 = new scrap.DummyScraper("");
            var fetchAndParseSpy1 = spyOn(scraper1, 'fetchAndParse');

            var scraper2 = new scrap.DummyScraper("");
            var fetchAndParseSpy2 = spyOn(scraper2, 'fetchAndParse');

            var scrobbler = new scrob.Scrobbler({ MockScraper1: scraper1, MockScraper2: scraper2 }, lastFmDao);

            var mockStation1 = { ScraperName: "MockScraper1", Session: "" };
            var mockStation2 = { ScraperName: "MockScraper2", Session: "" };

            var song11 = { Artist: "TestArtist11", Track: "TestTrack11" };
            fetchAndParseSpy1.andCallFake(function (cb) {
                cb(null, song11);
            });
            var song21 = { Artist: "TestArtist21", Track: "TestTrack21" };
            fetchAndParseSpy2.andCallFake(function (cb) {
                cb(null, song21);
            });
            scrobbler.scrapeAndScrobble([mockStation1, mockStation2], 1000);

            fetchAndParseSpy1.andCallFake(function (cb) {
                cb(null, song11);
            });
            var song22 = { Artist: "TestArtist22", Track: "TestTrack22" };
            fetchAndParseSpy2.andCallFake(function (cb) {
                cb(null, song22);
            });
            scrobbler.scrapeAndScrobble([mockStation1, mockStation2], 15 * 1000);

            fetchAndParseSpy1.andCallFake(function (cb) {
                cb(null, song11);
            });
            fetchAndParseSpy2.andCallFake(function (cb) {
                cb(null, song22);
            });
            scrobbler.scrapeAndScrobble([mockStation1, mockStation2], 37 * 1000);

            var song12 = { Artist: "TestArtist12", Track: "TestTrack12" };
            fetchAndParseSpy1.andCallFake(function (cb) {
                cb(null, song12);
            });
            fetchAndParseSpy2.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation1, mockStation2], 50 * 1000);

            fetchAndParseSpy1.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            fetchAndParseSpy2.andCallFake(function (cb) {
                cb(null, nullSong);
            });
            scrobbler.scrapeAndScrobble([mockStation1, mockStation2], 65 * 1000);

            expect(lastFmDao.postNowPlaying.callCount).toEqual(7);
            expect(lastFmDao.postNowPlaying.argsForCall[0][0]).toEqual(song11);
            expect(lastFmDao.postNowPlaying.argsForCall[1][0]).toEqual(song21);
            expect(lastFmDao.postNowPlaying.argsForCall[2][0]).toEqual(song11);
            expect(lastFmDao.postNowPlaying.argsForCall[3][0]).toEqual(song22);
            expect(lastFmDao.postNowPlaying.argsForCall[4][0]).toEqual(song11);
            expect(lastFmDao.postNowPlaying.argsForCall[5][0]).toEqual(song22);
            expect(lastFmDao.postNowPlaying.argsForCall[6][0]).toEqual(song12);

            expect(lastFmDao.scrobble.callCount).toEqual(1);
            expect(lastFmDao.scrobble.argsForCall[0][0]).toEqual(song11);
        });
    });
});

//# sourceMappingURL=scrobblerSpec.js.map
