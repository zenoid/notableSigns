window.gitdNotableSigns = window.gitdNotableSigns || {};

(function( app ) {

  'use strict';

  app.main = (function() {

    return {

      init: function( data ) {
        app.signsMap.setup( data );
      }

    };

  })();



  // ----------------- Data Loading, Data Parsing and Startup -----------------

  document.addEventListener( 'DOMContentLoaded', function() {

    d3.csv( 'data/signs.csv', function( data ) {

      var parsedData = {},
        signsData = {},
        average = 100 / 12,
        total, i, type, max, scale;

      // Getting the data

      data.map(function( d ) {
        for ( var o in d ) {
          if ( o !== 'Sign' ) {
            if ( !signsData[ o ] ) {
              signsData[ o ] = [];
            }
            signsData[ o ].push( +d[ o ] );
          }
        }
      });

      // Calculating differences from average

      for ( type in signsData ) {
        parsedData[ type ] = [];
        total = 0;
        for ( i = 0; i < signsData[ type ].length; i++ ) {
          total += signsData[ type ][ i ];
        }
        for ( i = 0; i < signsData[ type ].length; i++ ) {
          parsedData[ type ][ i ] =  Math.max( 0, signsData[ type ][ i ] / total * 100 - average );
        }
      }

      // Normalizing values

      for ( type in parsedData ) {
        max = d3.max( parsedData[ type ] );
        scale = d3.scale.linear().domain( [ 0, max ] ).range( [ 0, 1 ] );
        for ( i = 0; i < parsedData[ type ].length; i++ ) {
          parsedData[ type ][ i ] = scale( parsedData[ type ][ i ] );
        }
      }

      // Startup

      app.main.init( parsedData );

    });

  });

})( window.gitdNotableSigns );