// This file defines grunt tasks used by [Grunt.js](http://gruntjs.com/sample-gruntfile)
module.exports = function ( grunt ) {

  // Project configuration
  grunt.initConfig( {

    // Metadata
    pkg: grunt.file.readJSON( "package.json" ),
    banner: "/* ==========================================================\n"
          + " *                  GitGraph v<%= pkg.version %>\n"
          + " *      <%= pkg.repository.url %>\n"
          + " * ==========================================================\n"
          + " * Copyright (c) <%= grunt.template.today('yyyy') %>"
          + " Nicolas CARLO (@nicoespeon) ٩(^‿^)۶\n"
          + " * Copyright (c) <%= grunt.template.today('yyyy') %>"
          + " Fabien BERNARD (@fabien0102) ✌(✰‿✰)✌\n"
          + " *\n"
          + " * GitGraph.js may be freely distributed under the"
          + " <%= pkg.license %> Licence\n"
          + " * ========================================================== */\n",

    // The `clean` task ensures all files are removed from the misc. directories
    // so that no files linger from previous builds.
    clean: {
      dist: [ "dist/" ],
      jsdoc: [ "dist/jsdoc/" ],
      release: [ "build/", "docs/" ]
    },

    // The `concat` task copies the source file into the `build/` directory with
    // the compiled banner for release use.
    concat: {
      options: {
        banner: "<%= banner %>\n"
      },
      dist: {
        src: [ "src/gitgraph.js" ],
        dest: "dist/gitgraph.js"
      },
      release: {
        src: [ "src/gitgraph.js" ],
        dest: "build/gitgraph.js"
      }
    },
    copy: {
      dist: {
        files: [
          {src: ["src/gitgraph.css"], dest: "dist/gitgraph.css"}
        ]
      },
      release: {
        files: [
          {src: ["src/gitgraph.css"], dest: "build/gitgraph.css"}
        ]
      },
      server: {
        files: [
          {cwd: "src/", src: "*", dest: "server/", flatten: true, expand: true},
          {cwd: "examples/", src: ["*.js", "*.css"], dest: "server/", flatten: true, expand: true}
        ]
      }
    },

    // The `jsdoc` task will produce the code documentation for the whole project.
    jsdoc: {
      dist: {
        src: [ "temp/src/*.js", "README.md" ],
        options: {
          configure: '.jsdocrc',
          destination: "dist/docs"
        }
      },
      release: {
        src: [ "temp/src/*.js", "README.md" ],
        options: {
          configure: '.jsdocrc',
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

    // The `uglify` task will minified the JavaScript source code for production.
    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      dist: {
        src: [ "src/gitgraph.js" ],
        dest: "dist/gitgraph.min.js",
        options: {
          report: "min"
        }
      },
      release: {
        src: [ "src/gitgraph.js" ],
        dest: "build/gitgraph.min.js",
        options: {
          report: "min"
        }
      }
    },
                   
    // The `watch` task will monitor the projects files
    watch: {
     server: {
       options: { livereload: true },
       files: ["src/*", "examples/*"],
       tasks: ["copy:server"]
     }
    },
    express: {
      server: {
        options: {
          port: 9000,
          hostname: "0.0.0.0", // localhost|127.0.0.0
          bases: ["server"],
          livereload: true
        }
      }
    },
    open: {
      server: {
        path: "http://127.0.0.1:<%= express.server.options.port %>"
      }
    },
    "string-replace": {
       server: {
         files: {
           "server/index.html": "examples/index.html"
         },
         options: {
           replacements: [
             {
               pattern: "../src/gitgraph.css",
               replacement: "gitgraph.css"
             },
             {
               pattern: "../src/gitgraph.js",
               replacement: "gitgraph.js"
             },
           ]
         }
       },
       jsdoc: {
         files: {
           "temp/": "src/*.js"
          },
          options: {
            replacements: [
              {
                pattern: "(function () {",
                replacement: ""
              },
              {
                pattern: "})();",
                replacement: ""
              },
            ]
          }
        }
      }

  } );

  // Loads grunt tasks from `package.json`
  require( "load-grunt-tasks" )( grunt, [ "grunt-*" ] );

  // `grunt lint` will check code by running JSHint and unit tests over it.
  grunt.registerTask( "lint", [ "jshint", "jasmine" ] );

  // `grunt docs` will create non-versioned documentation for development use.
  grunt.registerTask( "docs", [ "string-replace:jsdoc", "jsdoc:dist", "clean:temp" ] );

  // `grunt dist` will create a non-versioned new release for development use.
  grunt.registerTask( "dist", [
    "clean:dist",
    "lint",
    "copy:dist",
    "uglify:dist",
    "string-replace:jsdoc",
    "jsdoc:dist",
    "clean:temp"
  ] );

  // `grunt release` will create a new release of the source code.
  grunt.registerTask( "release", [
    "lint",
    "copy:release",
    "concat:release",
    "uglify:release",
    "string-replace:jsdoc",
    "jsdoc:release",
    "clean:temp"
  ] );
  
  // `grunt server` will open a live reload server on your favorite browser
  grunt.registerTask('server', [
    "copy:server",
    "string-replace:server",
    "express:server",
    "open",
    "watch:server"
  ]);
};
