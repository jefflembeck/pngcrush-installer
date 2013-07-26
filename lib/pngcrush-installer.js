/*
 * pngcrush-installer
 * https://github.com/jlembeck/pngcrush-installer
 *
 */

/*global require:true*/
/*global process:true*/
/*global console:true*/
/*global __dirname:true*/
(function( exports ){
  "use strict";

// Requires
  var path = require('path'),
    which = require('which'),
    http = require( 'http' ),
    fs = require( 'fs' ),
    mkdirp = require( 'mkdirp' ),
    RSVP = require( './rsvp' ),
    execFile = require( "child_process" ).execFile;

  var expand = function( filepath ){
    var p = new RSVP.Promise();
    // expand
    execFile( "tar" , ["-xzvf", filepath ], function( err, stdout, stderr ){
      if( err ){
        p.reject( err );
      }
      p.resolve();
    });
    return p;
  };

  exports.getBinPath = function(){
      var fpath;
      try {
        fpath = which.sync('pngcrush');
      } catch(e) {
        fpath = process.platform === 'win32' ?
            path.join(__dirname, '..', 'pngcrush', 'pngcrush.exe') :
            path.join(__dirname, '..', 'pngcrush', 'bin' ,'pngcrush');
      } finally {
        return fpath;
      }
    };

  exports.getFileURL = function(){
    var url;
    if( process.platform.match(/win32/) ){
      url = "http://iweb.dl.sourceforge.net/project/pmt/pngcrush-executables/1.7.66/pngcrush_1_7_66_w32.exe";
    } else {
      url = "http://iweb.dl.sourceforge.net/project/pmt/pngcrush/1.7.66/pngcrush-1.7.66.tar.xz";
    }
    return url;
  };

  exports.downloadAndSave = function( url ){
    var promise = new RSVP.Promise();
    var urlArr = url.split( "/" );
    var filename = urlArr[ urlArr.length - 1 ];
    var dest = path.resolve( filename );
    var file = fs.createWriteStream( dest );

    http.get( url, function( response ) {
      response.pipe( file );
      file.on( 'finish' , function() {
        file.close();
        promise.resolve( dest );
      });
    });
    return promise;
  };

  exports.build = function( filepath ){

    var p = new RSVP.Promise();
    var fileArr = filepath.split( "/" );
    var filename = fileArr[ fileArr.length -1 ];
    var foldername = filename
                    .replace( /\.gz/, "" )
                    .replace( /\.tar/ , "" )
                    .replace( /\.xz/ , "" )
                    .replace( /\.exe/, "" );
    expand( filepath )
    .then( function(){
      process.chdir( foldername );
      execFile( "make" , [], function( err, stdout, stderr ){
        p.resolve({
          file: path.resolve( path.join( process.cwd() , "/pngcrush" )),
          destFolder: path.resolve( path.join( __dirname , '..', "/pngcrush/bin" )),
          dest: path.resolve( path.join( __dirname , '..',  "/pngcrush/bin/pngcrush" ))
        });
      });
    });
    return p;
  };

  exports.move = function( options ){
    var p = new RSVP.Promise(),
    f;
    if( !fs.existsSync( options.destFolder ) ){
      try {
        mkdirp.sync( options.destFolder );
      } catch( e ){
        throw new Error( e );
      }
    }

      try {
        f = fs.readFileSync( options.file );
      } catch( ex ){
        throw new Error( ex );
      }
      fs.writeFile( options.dest, f, { mode: 493 }, function( err ){
        if( err ){
          p.reject( err );
        }
        p.resolve();
      });
      return p;
  };

}( typeof exports === 'object' && exports || this ));

