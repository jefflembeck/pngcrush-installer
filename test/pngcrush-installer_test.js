/*global __dirname:true*/
/*global require:true*/
(function( exports ){
  "use strict";
  var path = require( 'path' );
  var fs = require( 'fs' );
  var pci = require( path.resolve( path.join( __dirname, "..", "lib", "pngcrush-installer" )));
  /*
    ======== A Handy Little Nodeunit Reference ========
    https://github.com/caolan/nodeunit

    Test methods:
      test.expect(numAssertions)
      test.done()
    Test assertions:
      test.ok(value, [message])
      test.equal(actual, expected, [message])
      test.notEqual(actual, expected, [message])
      test.deepEqual(actual, expected, [message])
      test.notDeepEqual(actual, expected, [message])
      test.strictEqual(actual, expected, [message])
      test.notStrictEqual(actual, expected, [message])
      test.throws(block, [error], [message])
      test.doesNotThrow(block, [error], [message])
      test.ifError(value)
  */

  exports['pngcrush-installer'] = {
    setUp: function(done) {
      // setup here
      done();
    },
    'getFileURL if not windows': function(test) {
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush/1.7.70/pngcrush-1.7.70.tar.gz";
      var isWin = false;
      var is64bit = false;
      test.expect(1);
      test.equal( pci.getFileURL( isWin, is64bit ), url );
      test.done();
    },
    'getFileURL if 32bit windows': function(test){
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w32.exe";
      var isWin = true;
      var is64bit = false;
      test.expect(1);
      test.equal( pci.getFileURL( isWin, is64bit ), url );
      test.done();
    },
    'getFileURL if 64bit windows': function(test){
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w64.exe";
      var isWin = true;
      var is64bit = true;
      test.expect(1);
      test.equal( pci.getFileURL( isWin, is64bit ), url );
      test.done();
    },
    'downloadAndSave if not windows old': function(test){
      test.expect(2);
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush/old-versions/1.7/1.7.67/pngcrush-1.7.67.tar.gz";
      var installerFilename = "pngcrush-1.7.67.tar.gz";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      pci.downloadAndSave( url )
      .then(function( d ){
        test.equal( dest, d );
        test.ok( fs.existsSync( dest ) );
        test.done();
      });
    },
    'downloadAndSave if not windows': function(test){
      test.expect(2);
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush/1.7.70/pngcrush-1.7.70.tar.gz";
      var installerFilename = "pngcrush-1.7.70.tar.gz";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      pci.downloadAndSave( url )
      .then(function( d ){
        test.equal( dest, d );
        test.ok( fs.existsSync( dest ) );
        test.done();
      });
    },
    'downloadAndSave if windows': function(test){
      test.expect(2);
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w32.exe";
      var installerFilename = "pngcrush_1_7_70_w32.exe";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      pci.downloadAndSave( url )
      .then(function( d , err ){
        test.equal( dest, d );
        test.ok( fs.existsSync( dest ) );
        test.done();
      });
    },
    'downloadAndSave if windows64': function(test){
      test.expect(2);
      var url = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w64.exe";
      var installerFilename = "pngcrush_1_7_70_w64.exe";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      pci.downloadAndSave( url )
      .then(function( d , err ){
        test.equal( dest, d );
        test.ok( fs.existsSync( dest ) );
        test.done();
      });
    },
    'build if not windows': function(test){
      test.expect(4);
      var installerFilename = "pngcrush-1.7.70.tar.gz";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      var filename = path.basename( dest );
      var foldername = filename
                      .replace( /\.gz/, "" )
                      .replace( /\.tar/ , "" )
                      .replace( /\.xz/ , "" )
                      .replace( /\.exe/, "" );
      pci.build( dest )
      .then(function( file , err ){
        test.ok( !err );
        test.equal( file.file, path.resolve( path.join( foldername , "pngcrush" )));
        test.equal( file.destFolder, path.resolve( path.join( __dirname , '..', "bin" )));
        test.equal( file.dest, path.resolve( path.join( __dirname , '..',  "bin", "pngcrush" )));
        test.done();
      });
    },
    'getFileURL return the expected url (basic)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush/1.7.70/pngcrush-1.7.70.tar.gz";
      var calculatedUrl = pci.getFileURL( false, false );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    },
    'getFileURL return the expected url (basic, archived)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush/old-versions/1.7/1.7.70/pngcrush-1.7.70.tar.gz";
      var calculatedUrl = pci.getFileURL( false, false, true );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    },
    'getFileURL return the expected url (windows)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w32.exe";
      var calculatedUrl = pci.getFileURL( true, false, false );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    },
    'getFileURL return the expected url (windows, archived)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/old-executables/1.7/1.7.70/pngcrush_1_7_70_w32.exe";
      var calculatedUrl = pci.getFileURL( true, false, true );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    },
    'getFileURL return the expected url (windows, x64)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/1.7.70/pngcrush_1_7_70_w64.exe";
      var calculatedUrl = pci.getFileURL( true, true, false );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    },
    'getFileURL return the expected url (windows, x64, archived)': function(test){
      test.expect(1);
      var expectedUrl = "http://downloads.sourceforge.net/project/pmt/pngcrush-executables/old-executables/1.7/1.7.70/pngcrush_1_7_70_w64.exe";
      var calculatedUrl = pci.getFileURL( true, true, true );
      test.equal( expectedUrl, calculatedUrl );
      test.done();
    }/**,
    'build if windows 32': function(test){
      test.expect(4);
      var installerFilename = "pngcrush_1_7_66_w32.exe";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      var filename = path.basename( dest );
      var foldername = filename
                      .replace( /\.gz/, "" )
                      .replace( /\.tar/ , "" )
                      .replace( /\.xz/ , "" )
                      .replace( /\.exe/, "" );
      pci.build( dest )
      .then(function( file , err ){
        test.ok( !err );
        test.equal( file.file, path.resolve( path.join( foldername , "pngcrush" )));
        test.equal( file.destFolder, path.resolve( path.join( __dirname , '..', "bin" )));
        test.equal( file.dest, path.resolve( path.join( __dirname , '..',  "bin", "pngcrush.exe" )));
        test.done();
      });
    },
    'build if windows 64': function(test){
      test.expect(4);
      var installerFilename = "pngcrush_1_7_66_w64.exe";
      var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
      var filename = path.basename( dest );
      var foldername = filename
                      .replace( /\.gz/, "" )
                      .replace( /\.tar/ , "" )
                      .replace( /\.xz/ , "" )
                      .replace( /\.exe/, "" );
      pci.build( dest )
      .then(function( file , err ){
        test.ok( !err );
        test.equal( file.file, path.resolve( path.join( foldername , "pngcrush" )));
        test.equal( file.destFolder, path.resolve( path.join( __dirname , '..', "bin" )));
        test.equal( file.dest, path.resolve( path.join( __dirname , '..',  "bin", "pngcrush.exe" )));
        test.done();
      });
    }*/
  };
}( typeof exports === 'object' && exports || this ));
