/*global require:true*/
/*global console:true*/
/*global process:true*/
(function(){
  "use strict";

  var os = require( 'os' );

  var which = require( 'which' ),
  pngc, pci, data, url, isWin, isWin64;

  // Credit to Obvious Corp for finding this fix.
  var originalPath = process.env.PATH;
  // NPM adds bin directories to the path, which will cause `which` to find the
  // bin for this package not the actual pngcrush bin.
  process.env.PATH = originalPath.replace(/:[^:]*node_modules[^:]*/g, '');

  isWin = os.platform() === "win32";
  isWin64 = isWin && (os.arch() === "x64");

  try {
    pngc = which.sync( "pngcrush" );
    if( pngc ){
      process.exit();
    }
  } catch( e ){
    pci = require( "./lib/pngcrush-installer" );

    url = pci.getFileURL( isWin, isWin64 );

    pci.downloadAndSave( url )
    .then( pci.build )
    .then( pci.move )
    .then( pci.deleteTemp )
    .then( function( _null , err ){
      if( err ){
        console.log( err );
        process.exit(1);
      }
      process.exit(0);
    });
  }

}());
