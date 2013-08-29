pngcrush-installer
==================

An NPM-based installer for pngcrush.


#Usage

When installed on a project, pngcrush-installer places the appropriate binary in the relative bin path to the project.

Example:

```
./node_modules/pngcrush-installer/bin/pngcrush
```

Should call the pngcrush binary.

This can be accessed if requiring the module within your project by calling 

```
require( 'pngcrush-installer' ).getBinPath()
```
