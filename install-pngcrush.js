/*global require:true*/
/*global process:true*/
(function(){
  "use strict";

  var which = require( 'which' ),
  pngc, pci, data, url, isWin;

  // Credit to Obvious Corp for finding this fix.
  var originalPath = process.env.PATH;
  // NPM adds bin directories to the path, which will cause `which` to find the
  // bin for this package not the actual pngcrush bin.
  process.env.PATH = originalPath.replace(/:[^:]*node_modules[^:]*/g, '');

  isWin = process.platform.match(/win32/);

  try {
    pngc = which.sync( "pngcrush" );
    if( pngc ){
      process.exit();
    }
  } catch( e ){
    pci = require( "./lib/pngcrush-installer" );

    url = pci.getFileURL( isWin );

    pci.downloadAndSave( url )
    .then( pci.build )
    .then( pci.move )
    .then( pci.deleteTemp );
  }

}());
