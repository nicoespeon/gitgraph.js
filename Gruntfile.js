// This file defines grunt tasks used by [Grunt.js](http://gruntjs.com/sample-gruntfile)
module.exports = function ( grunt ) {

  // Initialize tasks for Grunt
  grunt.initConfig( {

    // The `jsdoc` task will produce the code documentation for the whole project.
    jsdoc: {
      dist: {
        src: [ "src/*.js" ],
        options: {
          destination: "dist/docs"
        }
      },
      release: {
        src: [ "src/*.js" ],
        options: {
          destination: "docs"
        }
      }
    },

    // The `jasmine` task run unit tests over the source code
    jasmine: {
      gitgraph: {
        src: "src/*.js",
        options: {
          specs: "tests/*.js"
        }
      }
    },

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
