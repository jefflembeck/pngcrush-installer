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
    os = require( 'os' ),
    fs = require( 'fs' ),
    mkdirp = require( 'mkdirp' ),
    RSVP = require( './rsvp' ),
    execFile = require( "child_process" ).execFile;

  var expand = function( filepath , isWin ){
    var p = new RSVP.Promise();
    if( isWin ){
      p.resolve();
    } else {
      execFile( "tar" , ["-xzvf", filepath ], function( err, stdout, stderr ){
        if( err ){
          p.reject( err );
        }
        if( stderr ){
          console.log( stderr );
        }
        p.resolve();
      });
    }
    return p;
  };

  exports.getBinPath = function( isWin ){
    var fpath;
    fpath = !!isWin ?
        path.join(__dirname, '..', 'bin', 'pngcrush.exe') :
        path.join(__dirname, '..', 'bin', 'pngcrush');
    return fpath;
  };

  exports.getFileURL = function( isWin , isWin64 ){
    var url;
    if( !!isWin && !!isWin64 ){
      url = "http://iweb.dl.sourceforge.net/project/pmt/pngcrush-executables/1.7.66/pngcrush_1_7_66_w64.exe";
    } else if( !!isWin ) {
      url = "http://iweb.dl.sourceforge.net/project/pmt/pngcrush-executables/1.7.66/pngcrush_1_7_66_w32.exe";
    } else {
      url = "http://superb-dca3.dl.sourceforge.net/project/pmt/pngcrush/1.7.66/pngcrush-1.7.66.tar.gz";
    }
    return url;
  };

  exports.downloadAndSave = function( url ){
    var promise = new RSVP.Promise();
    var urlArr = url.split( "/" );
    var filename = urlArr[ urlArr.length - 1 ];
    var dest = path.resolve( path.join( __dirname , '..' , filename ) );
    var file = fs.createWriteStream( dest );

    http.get( url, function( response ) {
      var r = response.pipe( file );
      r.on( 'close' , function(){
        console.log( "File downloaded to: " + dest );
        promise.resolve( dest );
      });
      file.on( 'error' , function( err ){
        promise.reject( err );
      });
    });
    return promise;
  };

  exports.build = function( filepath ){

    var p = new RSVP.Promise();
    var isWin = os.platform() === "win32";
    var isWin64 = isWin && (os.arch() === "x64");
    var filename = path.basename( filepath );
    var foldername = filename
                    .replace( /\.gz/, "" )
                    .replace( /\.tar/ , "" )
                    .replace( /\.xz/ , "" )
                    .replace( /\.exe/, "" );
    expand( filepath , isWin )
    .then( function(){
      if( isWin ){
        var file = "pngcrush_1_7_66_w32.exe";
        if( isWin64 ){
          file = "pngcrush_1_7_66_w64.exe";
        }
        p.resolve({
          file: path.resolve( path.join( __dirname, '..', file )),
          destFolder: path.resolve( path.join( __dirname , '..', "bin" )),
          dest: path.resolve( path.join( __dirname , '..',  "bin", "pngcrush.exe" ))
        });
      } else {
        execFile( "make" , [ "-C", path.resolve( foldername ) ], function( err, stdout, stderr ){
          if( err ){
            p.reject( err );
          }
          p.resolve({
            file: path.resolve( path.join( foldername , "pngcrush" )),
            destFolder: path.resolve( path.join( __dirname , '..', "bin" )),
            dest: path.resolve( path.join( __dirname , '..',  "bin", "pngcrush" ))
          });
        });
      }
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
        console.log( e );
        throw new Error( e );
      }
    }

    try {
      f = fs.readFileSync( options.file );
    } catch( ex ){
      throw new Error( ex );
    }
    fs.writeFile( options.dest, f, function( err ){
      if( err ){
        p.reject( err );
      }
      fs.chmod( options.dest, 493, function( e ){
        if( e ){
          p.reject( e );
        }
              p.resolve();
      });
    });
    return p;
  };

}( typeof exports === 'object' && exports || this ));
