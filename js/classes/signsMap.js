window.gitdNotableSigns = window.gitdNotableSigns || {};

(function( app ) {

  'use strict';

  app.signsMap = (function() {

    var data, signItems, typeItems, selectedSign, selectedType,

      colorLow = '#DDDDDD',
      colorHi = '#000000',
      colorSelected = '#FF3333',

      signScaleMin = 0.4,
      signScaleMax = 1.65,
      typeScaleMin = 0.8,
      typeScaleMax = 2,

      signsList = [ 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces' ],
      typesList = [
        { id:  0, sourceId: 'Athlete', label: 'Athlete' },
        { id:  1, sourceId: 'Artist', label: 'Artist' },
        { id:  2, sourceId: 'Politician', label: 'Politician' },
        { id:  3, sourceId: 'MilitaryPerson', label: 'Military' },
        { id:  4, sourceId: 'Scientist', label: 'Scientist' },
        { id:  5, sourceId: 'Cleric', label: 'Cleric' },
        { id:  6, sourceId: 'Royalty', label: 'Royalty' },
        { id:  7, sourceId: 'Judge', label: 'Judge' },
        { id:  8, sourceId: 'Criminal', label: 'Criminal' },
        { id:  9, sourceId: 'Model', label: 'Model' },
        { id: 10, sourceId: 'Architect', label: 'Architect' },
        { id: 11, sourceId: 'Philosopher', label: 'Philosopher' },
        { id: 12, sourceId: 'Economist', label: 'Economist' },
        { id: 13, sourceId: 'Astronaut', label: 'Astronaut' },
        { id: 14, sourceId: 'Engineer', label: 'Engineer' },
        { id: 15, sourceId: 'Journalist', label: 'Journalist' },
        { id: 16, sourceId: 'Chef', label: 'Chef' },
        { id: 17, sourceId: 'PlayboyPlaymate', label: 'Playmate' }
      ];



    // ----------------- Create Interface -----------------

    function createInterface() {

      d3.selectAll( '#signs' ).append( 'ul' )
        .selectAll( 'li' )
        .data( signsList )
        .enter()
        .append( 'li' )
        .each( function( d, i ) {
          d3.select( this ).html( d );
        });

      signItems = d3.selectAll( '#signs li' )
        .data( signsList )
        .append( 'div' )
        .each( function( d, i ) {
          d3.select( this )
            .attr( 'class', 'sign-' + d.toLowerCase() )
            .on( 'click', function( e ){
              selectSign( i );
            });
        });

      d3.shuffle( typesList );

      typeItems = d3.selectAll( '#types' ).append( 'ul' )
        .selectAll( 'li' )
        .data( typesList )
        .enter()
        .append( 'li' )
        .each( function( d, i ) {
          d3.select( this ).html( d.label )
            .on( 'click', function( e ){
              selectType( e );
            });
        });

      resetSelection();

    }



    // ----------------- Selection -----------------

    function setItemValue( item, size, color, isSign ) {
      if ( isSign ) {
        item.transition().duration( 500 )
          .style( 'transform', 'scale(' + size + ')' )
          .style( 'background-color', color );
      } else {
        item.transition().duration( 500 )
          .style( 'transform', 'scale(' + size + ')' )
          .style( 'color', color );
      }
    }

    function setItemSelected( item, isSign ) {
      if ( isSign ) {
        item.transition().duration( 500 )
          .style( 'transform', 'scale(' + signScaleMax + ')' )
          .style( 'background-color', colorSelected );
      } else {
        item.transition().duration( 500 )
          .style( 'transform', 'scale(' + typeScaleMax + ')' )
          .style( 'color', colorSelected );
      }
    }

    function resetSelection() {

      selectedSign = null;
      selectedType = null;

      d3.selectAll( signItems[ 0 ] )
        .each( function( d, i ) {
          setItemValue( d3.select( this ), 1, colorLow, true );
        });

      d3.selectAll( typeItems[ 0 ] )
        .each( function( d, i ) {
          setItemValue( d3.select( this ), 1, colorHi );
        });

    }



    // ----------------- Sign Selection -----------------

    function selectSign( s ) {

      if ( selectedSign === s ) {
        resetSelection();
        return;
      }

      selectedSign = s;
      selectedType = null;

      var values = [], t, max;
      for ( t in data ) {
        values.push( data[ t ][ s ] );
      }
      max = d3.max( values );

      var sizeScale = d3.scale.linear().domain( [ 0, max ] ).range( [ typeScaleMin, typeScaleMax ] ),
        colorScale = d3.scale.pow().exponent( 2 ).domain( [ 0, max ] ).range( [ colorLow, colorHi ] );

      d3.selectAll( signItems[ 0 ] )
        .each( function( d, i ) {
          if ( i !== s ) {
            setItemValue( d3.select( this ), signScaleMin, colorScale( 0 ), true );
          } else {
            setItemSelected( d3.select( this ), true );
          }
        });

      d3.selectAll( typeItems[ 0 ] )
        .each( function( d, i ) {
          setItemValue( d3.select( this ), sizeScale( data[ d.sourceId ][ s ] ), colorScale( data[ d.sourceId ][ s ] ) );
        });

    }



    // ----------------- Type Selection -----------------

    function selectType( tData ) {

      if ( selectedType === tData.id ) {
        resetSelection();
        return;
      }

      selectedType = tData.id;
      selectedSign = null;

      var sizeScale = d3.scale.linear().domain( [ 0, 1 ] ).range( [ signScaleMin, signScaleMax ] ),
        colorScale = d3.scale.pow().exponent( 2 ).domain( [ 0, 1 ] ).range( [ colorLow, colorHi ] );

      d3.selectAll( typeItems[ 0 ] )
        .each( function( d ) {
          if ( d.id !== tData.id ) {
            setItemValue( d3.select( this ), typeScaleMin, colorScale( 0 ) );
          } else {
            setItemSelected( d3.select( this ) );
          }
        });

      d3.selectAll( signItems[ 0 ] )
        .each( function( d, i ) {
          setItemValue( d3.select( this ), sizeScale( data[ tData.sourceId ][ i ] ), colorScale( data[ tData.sourceId ][ i ] ), true );
        });

    }



    // ----------------- Public Methods -----------------

    return {

      setup: function( d ) {
        data = d;
        createInterface();
      }

    };

  })();

})( window.gitdNotableSigns );