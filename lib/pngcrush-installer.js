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
  var version = "1.7.70";
  var version_underscored = "1_7_70";
  var archived_prefix = "1.7";

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
      console.log('Extracting '+filepath+'...');
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

  exports.getFileURL = function( isWin , isWin64, archived ){
    var url = "http://downloads.sourceforge.net/project/pmt";

    if ( archived === undefined ) {
      archived = false;
    }

    if( !!isWin ) {
      url += "/pngcrush-executables";

      if ( archived ) {
        url += "/old-executables/" + archived_prefix;
      }

      url += "/" + version + "/pngcrush_" + version_underscored;

      if( !!isWin64 ){
        url += "_w64.exe";
      } else {
        url += "_w32.exe";
      }
    } else {
      url += "/pngcrush";

      if ( archived ) {
        url += "/old-versions/" + archived_prefix;
      }

      url += "/" + version + "/pngcrush-" + version + ".tar.gz";
    }

    return url;
  };

  exports.downloadAndSave = function( url ){
    var promise = new RSVP.Promise();
    var urlArr = url.split( "/" );
    var installerFilename = urlArr[ urlArr.length - 1 ];
    var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
    var maxRedirects = 3; // Capped at 3. Should be adequate.
    var redirectCount = 0;
    var file = fs.createWriteStream( dest );
    var isWin = path.extname( installerFilename ) === ".exe";

    file.on('open',function(fd){
      var getDownload = function(url){
        console.log('GET: ' +url);
        http.get(url,function(response){
          console.log('Status: '+response.statusCode);

          if( response.statusCode === 302 && maxRedirects > redirectCount ){
            redirectCount++;
            console.log("\nRedirecting...\n");
            return getDownload(response.headers.location);
          } else if ( response.statusCode == 404 ) {
            promise.reject('404 - File not found');
            return;
          } else {
            console.log('\nDownloading '+installerFilename+'...');
          }

          var r = response.pipe( file );

          r.on( 'close' , function() {
            console.log('Download complete!\n');

            var destRelative = dest;
            if(~dest.indexOf('/node_modules/')){
              destRelative = "./node_modules/"+dest.split('/node_modules/')[1];
            }

            // Test the validity of the downloaded archive
            // Only works on unix systems.
            // TODO: Check for gunzip (?)
            if( !isWin ){
              execFile( "gunzip", ["-t", dest], function(err, stdout, stderr){
                if( err || stderr ){
                  console.log( ''+installerFilename+' is not a valid tar archive.' );
                  promise.reject(err);
                } else {
                  console.log( ''+installerFilename+' is a valid tar archive.' );
                  promise.resolve( dest );
                }
              });
            } else {
              promise.resolve( dest );
            }
          });
        }).on( 'error' , function( err ){
          console.log('Request error');
          promise.reject( err );
        });
      };

      getDownload(url);

    }).on( 'error' , function( err ){
      console.log('File error');
      promise.reject( err );
    });

    return promise;
  };

  exports.build = function( filepath ){

    var p = new RSVP.Promise();
    var isWin = path.extname( filepath ) === ".exe";
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
        console.log('Installing '+foldername+'...');
        var file = "pngcrush_" + version_underscored + "_w32.exe";
        if( isWin64 ){
          file = "pngcrush_" + version_underscored + "_w64.exe";
        }
        p.resolve({
          file: path.resolve( path.join( __dirname, '..', file )),
          destFolder: path.resolve( path.join( __dirname , '..', "bin" )),
          dest: path.resolve( path.join( __dirname , '..',  "bin", "pngcrush.exe" ))
        });
      } else {
        console.log('Building '+foldername+'...');
        execFile( "make" , [ "-C", path.resolve( foldername ) ], function( err, stdout, stderr ){
          if( err ){
            p.reject( err );
          }
          p.resolve({
            file: path.resolve( path.join( foldername , "pngcrush" )),
            destFolder: path.resolve( path.join( __dirname , '..', "bin" )),
            dest: path.resolve( path.join( __dirname , '..',  "bin", "pngcrush" ))
          });
          console.log('Success!\n');
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
