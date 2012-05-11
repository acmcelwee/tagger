var argv = require('optimist').demand('f').argv,
    apiKey = 'FDA2EF936F4B9366',
    baseMirrorPath = 'http://thetvdb.com',
    Shred = require('shred'),
    shred = new Shred(),
    sprintf = require('sprintf').sprintf,
    xml2js = require('xml2js');

/**
 * Pull down latest mirrors for TheTVDB
 * @param callback
 */
function retrieveMirrors( callback ) {
    var mirrorsUrlPattern = 'http://www.thetvdb.com/api/%s/mirrors.xml',
        mirrorsUrl = sprintf(mirrorsUrlPattern, apiKey);
    
    shred.get({
        url : mirrorsUrl,
        on : {
            200 : function(response) {
                parseXml(response.content.body, function(result) {
                    callback(result);
                });
            }
        }
    })
}

function parseXml(xmlDataStream, callback) {
    var parser = new xml2js.Parser();

    parser.on('end', function(result) {
        callback(result);
    });

    parser.parseString(xmlDataStream);
}

function retrieveServerTime() {
    var url = 'http://www.thetvdb.com/api/Updates.php?type=none';

    shred.get({
        url : url,
        on : {
            200 : function(response) {
                parseXml(response.content.body, function(result) {
                    console.log(result);
                });
            }
        }
    })
}

function getSeries(name, callback) {
    var baseUrl = 'http://www.thetvdb.com/api/GetSeries.php?seriesname=';

    shred.get({
        url : baseUrl + encodeURIComponent(name),
        on : {
            200 : function(response) {
                parseXml(response.content.body, function(result) {
                    if (result.Series.length && result.Series[0].SeriesName === name) {
                        console.log(result.Series[0]);
                        callback(result.Series[0].seriesid);
                    } else {
                        callback();
                    }
                });
            }
        }
    });
}

function getSeriesInfo(seriesId, callback) {
    var seriesInfoUrl = sprintf('%s/api/%s/series/%s/all/en.xml', baseMirrorPath, apiKey, seriesId);

    shred.get({
        url : seriesInfoUrl,
        on : {
            200 : function(response) {
                parseXml(response.content.body, function(result) {
                    callback(result);
                })
            }
        }
    });
}

function getBanners(seriesId, callback) {
    var bannersUrl = sprintf('%s/api/%s/series/%s/banners.xml', baseMirrorPath, apiKey, seriesId);

    shred.get({
        url : bannersUrl,
        on : {
            200 : function(response) {
                parseXml(response.content.body, function(result) {
                    callback(result);
                });
            }
        }
    })
}

if (argv.m) {
    retrieveMirrors(function(url) {
        console.log(url);
    });
}

retrieveServerTime();

getSeries("Dexter", function(seriesId) {
    console.log(seriesId);
//    getSeriesInfo(seriesId, function(response) {
//        console.log(response);
//    });
    getBanners(seriesId, function(result) {
        console.log(result);
    });
});
