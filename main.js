var optimist = require('optimist'),
    apiKey = '3F9F02EE949DBFC4',
    exec = require('child_process').exec,
    Q = require('q'),
    shows = {},
    episodesByShow = {},
    tvdb = new (require('node-tvdb'))({ apiKey : apiKey }),
    tvShowRegex = /(.*)[sS]\.?(\d{2})\.?[eE]\.?(\d{2}).*/,
    _ = require('underscore')._,
    _s = require('underscore.string'),
    argv = optimist.argv,
    regexMatch;

regexMatch = tvShowRegex.exec( argv.s );

function findShowInfo( showName ) {
    var deferred = Q.defer();
    
    if ( !shows[ showName ] ) {
        tvdb.findTvShow( showName, function(err, response ) {
            var match = _.find( response, function( show ) {
                return showName && show.name.toLowerCase() === showName.toLowerCase();
            });

            if ( match ) {
                shows[ showName ] = match;
                deferred.resolve( match );
            }
        });
    } else {
        deferred.resolve( shows[ showName ] );
    }

    return deferred.promise;
}

function findEpisodeInfo( show ) {
    var deferred = Q.defer();

    if ( episodesByShow[ show.id ] ) {
        deferred.resolve( episodesByShow[ show.id ] );
    } else {
        tvdb.getInfo( null, show.id, function( err, response ) {

            response = processEpisodesResponse( response );
            episodesByShow[ show.id ] = response;
            deferred.resolve( response );
        });
    }

    return deferred.promise;
}

function processEpisodesResponse( response ) {
    var result = {};
    
    _.each( response, function( episode ) {
        var season = result[ episode.SeasonNumber ] || {};
        season[ episode.EpisodeNumber ] = episode;
        result[ episode.SeasonNumber ] = season;
    });

    return result;
}

if ( regexMatch ) {
    findShowInfo( _s.clean( regexMatch[ 1 ].replace(/\./g, ' ') ) )
        .then( function( show ) {
            return findEpisodeInfo( show );
        })
        .then( function( episodes ) {
            var seasonNumber = _s.toNumber( regexMatch[ 2 ] ).toString(),
                episodeNumber = _s.toNumber( regexMatch[ 3 ] ).toString(),
                season = episodes[ seasonNumber ],
                episode = season && season[ episodeNumber ];

            console.log( episode );

//            console.log( foo );
//            function puts(error, stdout, stderr) {
//                console.log(stderr);
//                console.log(stdout);
//            }
//            exec('AtomicParsley', puts);
        });
}