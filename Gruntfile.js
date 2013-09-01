// This file defines grunt tasks used by [Grunt.js](http://gruntjs.com/sample-gruntfile)
module.exports = function ( grunt ) {

  // Initialize tasks for Grunt
  grunt.initConfig( {

    // The `jshint` task lint all the JavaScript code against best practices.
    // Warnings are here to help us improve code and follow best standards.
    jshint: {
      src: [ "src/*.js" ],
      options: {
        force: true,
        jshintrc: ".jshintrc"
      }
    }

  } );

  // Loads grunt tasks from `package.json`
  require( "load-grunt-tasks" )( grunt, [ "grunt-*" ] );

};
