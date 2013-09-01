// This file defines grunt tasks used by [Grunt.js](http://gruntjs.com/sample-gruntfile)
module.exports = function ( grunt ) {

  // Initialize tasks for Grunt
  grunt.initConfig( {

    // Metadata
    pkg: grunt.file.readJSON("package.json"),
    banner: "/* ==========================================================\n" +
            " *                  GitGraph v<%= pkg.version %>\n" +
            " *      <%= pkg.repository.url %>\n" +
            " * ==========================================================\n" +
            " * Copyright (c) <%= grunt.template.today('yyyy') %>" +
            " Nicolas CARLO (@nicoespeon) ٩(^‿^)۶\n" +
            " * Copyright (c) <%= grunt.template.today('yyyy') %>" +
            " Fabien BERNARD (@fabien0102) ✌(✰‿✰)✌\n" +
            " *\n" +
            " * GitGraph.js may be freely distributed under the" +
            " <%= pkg.license %> Licence\n" +
            " * ========================================================== */\n",

    // The `clean` task ensures all files are removed from the `dist/` directory
    // so that no files linger from previous builds.
    clean: [ "dist/" ],

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
    },


    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      gitgraph: {
        src: [ "src/gitgraph.js" ],
        dest: "dist/js/gitgraph.min.js"
      }
    }

  } );

  // Loads grunt tasks from `package.json`
  require( "load-grunt-tasks" )( grunt, [ "grunt-*" ] );

};
