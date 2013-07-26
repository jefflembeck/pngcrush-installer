/*global require:true*/
/*global process:true*/
(function(){
  "use strict";

  var which = require( 'which' ), pngc;

  try {
    which.sync( "pngcrush" );
    if( pngc ){
      process.exit();
    }
  } catch( e ){
    var pci = require( "./lib/pngcrush-installer" );

    var url = pci.getFileURL();

    pci.downloadAndSave( url )
    .then( pci.build )
    .then( pci.move )
    .then( pci.deleteTemp );
  }

}());
