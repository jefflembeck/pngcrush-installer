module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		nodeunit: {
			files: ['test/**/*.js']
		},
		lint: {
			files: ['Gruntfile.js', 'test/**/*.js']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: false,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				smarttabs: true,
				node: true,
				es5: true,
				strict: false
			},
			globals: {
				window: true
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );

	// Default task.
	grunt.registerTask('default', ['jshint', 'nodeunit']);
	grunt.registerTask('travis', ['jshint', 'nodeunit']);

};
