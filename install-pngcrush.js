/*global require:true*/
/*global process:true*/
(function(){
  "use strict";

  var which = require( 'which' ),
  pngc, pci, url;

  // Credit to Obvious Corp for finding this fix.
  var originalPath = process.env.PATH;
  // NPM adds bin directories to the path, which will cause `which` to find the
  // bin for this package not the actual phantomjs bin.
  process.env.PATH = originalPath.replace(/:[^:]*node_modules[^:]*/g, '');

  try {
    pngc = which.sync( "pngcrush" );
    if( pngc ){
      process.exit();
    }
  } catch( e ){
    pci = require( "./lib/pngcrush-installer" );

    url = pci.getFileURL();

    pci.downloadAndSave( url )
    .then( pci.build )
    .then( pci.move )
    .then( pci.deleteTemp );
  }

}());
