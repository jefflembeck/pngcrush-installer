/*global require:true*/
(function(){
  "use strict";

  var which = require( 'which' );
  var pngc = which.sync( "pngcrush" );

  if( pngc ){
 //   process.exit();
  }

  var pci = require( "./lib/pngcrush-installer" );

  var url = pci.getFileURL();

  pci.downloadAndSave( url )
  .then( pci.build )
  .then( pci.move )
  .then( pci.deleteTemp );
}());
