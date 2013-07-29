#!/usr/bin/env node

var path = require('path'),
    execFile = require('child_process').execFile,
    pci = require( path.join( __dirname, '..', 'lib', 'pngcrush-installer') );

var binPath = pci.getBinPath();

var args = process.argv.slice(2);

execFile( binPath, args, function( err, stdout, stderr ){
  if( err ){
    throw err;
  }
  if( stdout ){
    console.log( stdout );
  }
  if( stderr ){
    console.log( stderr );
  }
  process.exit();
});

process.on('SIGTERM', function() {
  cp.kill('SIGTERM');
  process.exit(1);
});
