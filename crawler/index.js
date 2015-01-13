
var request = require( 'request' ),
  fs = require( 'fs' ),

  people = {},
  signs = [],

  typeIndex = 0,
  typesList = [ 'Athlete', 'Artist', 'Politician', 'MilitaryPerson', 'Scientist', 'Cleric', 'Royalty', 'Judge', 'Criminal', 'Model', 'Architect', 'Philosopher', 'Economist', 'Astronaut', 'Engineer', 'Journalist', 'Chef', 'PlayboyPlaymate' ],

  signsList = [ 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces' ],
  signValues = [ 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
  signEndDates = [ new Date( '2012-01-20'), new Date( '2012-02-19'), new Date( '2012-03-20'), new Date( '2012-04-20'), new Date( '2012-05-20'), new Date( '2012-06-21'), new Date( '2012-07-22'), new Date( '2012-08-23'), new Date( '2012-09-22'), new Date( '2012-10-22'), new Date( '2012-11-22'), new Date( '2012-12-21'), new Date( '2012-12-31') ],
  // 2012 = leap year

  offset = 0,
  offsetDelta = 10000,
  startTime,

  baseUrl = 'http://dbpedia.org/sparql',
  peopleDataFile = 'output/people.json',
  signsDataFile = 'output/signs.csv',

  queryPeopleNum = 'SELECT (count(distinct ?person) as ?count) WHERE { ?person a dbpedia-owl:%type% ; dbpedia-owl:birthDate ?birthDate . FILTER( datatype(?birthDate) = xsd:date ) MINUS { ?person a dbpedia-owl:FictionalCharacter } }',

  queryPeopleList = 'SELECT DISTINCT * WHERE { ?person a dbpedia-owl:%type% ; dbpedia-owl:birthDate ?birthDate . FILTER( datatype(?birthDate) = xsd:date ) MINUS { ?person a dbpedia-owl:FictionalCharacter } } LIMIT ' + offsetDelta + ' OFFSET ';

// January 2015
// Total people on DBPedia: 1.649.645
// Non-fictional People: 1.638.710
// People with full birth date: 761.440



// ----------------- Querying DBPedia -----------------

function getQueryUrl( q, v ) {
  return encodeURI( baseUrl + '?query=' + q.replace( '%type%', v ) + '&format=json' );
}

function getJson( url, callback ) {
  request( url, function ( err, response, body ) {
    if ( !err && response.statusCode == 200 ) {
      var json = JSON.parse( body );
      callback( null, json );
    } else {
      console.error( err );
    }
  });
}

function getPeopleNum() {
  getJson( getQueryUrl( queryPeopleNum, 'Person' ), function ( err, _data ) {
    var results = _data.results.bindings;
    console.log( 'TOTAL PEOPLE: ' + results[ 0 ].count.value );
  });
}

function getPeopleOfType() {
  offset = 0;
  console.log( '--- GETTING PEOPLE OF TYPE', typesList[ typeIndex ] );
  getPeopleOfTypeGroup();
}

function getPeopleOfTypeGroup() {
  console.log( 'Offset: ', offset );
  getJson( getQueryUrl( queryPeopleList + offset, typesList[ typeIndex ] ), function ( err, _data ) {
    if ( !err ) {
      var results = _data.results.bindings;
      console.log( 'Results:', results.length );
      if ( results.length > 0 ) {
        for ( var i in results ) {
          var date = results[ i ].birthDate.value.split( '-' );
          people[ results[ i ].person.value ] = {
            month: parseInt( date[ date.length - 2 ], 10 ),
            day: parseInt( date[ date.length - 1 ], 10 ),
            type: typesList[ typeIndex ]
          };
        }
        offset += offsetDelta;
        getPeopleOfTypeGroup();
      } else {
        typeIndex++;
        if ( typeIndex < typesList.length ) {
          getPeopleOfType( typeIndex );
        } else {
          savePeopleDataFile();
        }
      }
    } else {
      console.error( err );
    }
  });
}

function savePeopleDataFile() {
  fs.writeFile( peopleDataFile, JSON.stringify( people, null, '\t' ), function( err ){
    if ( err ) throw err;
    console.log( '--- People file saved' );
    parseBirthData();
  });
}



// ----------------- Parsing birth dates -----------------

function parseBirthData() {

  var i, t, d,
    birthData;

  for ( i = 0; i < signsList.length; i ++ ) {
    signs[ i ] = {};
    for ( t = 0; t < typesList.length; t++ ) {
      signs[ i ][ typesList[ t ] ] = 0;
    }
  }

  fs.readFile( peopleDataFile, 'utf-8', function( err, data ){
    birthData = JSON.parse( data );
    for ( var p in birthData ) {
      d = new Date( '2012-' + birthData[ p ].month + '-' + birthData[ p ].day );
      i = 0;
      while ( signEndDates[ i ] < d ) {
        i++;
      }
      if ( birthData[ p ].type ) {
        signs[ signValues[ i ] ][ birthData[ p ].type ]++;
      }
    }
    saveSignsData();
  });

}

function saveSignsData() {

  var i, t,
    signsData = '';

  signsData = 'Sign';
  for ( t = 0; t < typesList.length; t++ ) {
    signsData += ',' + typesList[ t ];
  }
  signsData += '\n';

  for ( i = 0; i < signs.length; i++ ) {
    signsData += signsList[ i ];
    for ( t = 0; t < typesList.length; t++ ) {
      signsData += ',' + signs[ i ][ typesList[ t ] ];
    }
    signsData += '\n';
  }

  fs.writeFile( signsDataFile, signsData, function( err ){
    if ( err ) throw err;
    console.log( '--- Signs file saved' );
    console.log( 'Elapsed time: ' + Math.round( ( new Date().getTime() - startTime ) / 60000 ) + ' minutes' );
  });

}



// ----------------- Startup -----------------

function start() {
  startTime = new Date().getTime();
  getPeopleOfType();
}

start();


