![gitgraph.js](/assets/logo/gitgraph-logo.png)

[![Build Status](https://secure.travis-ci.org/nicoespeon/gitgraph.js.png)](http://travis-ci.org/nicoespeon/gitgraph.js)
===========

A JavaScript library to draw pretty git graphs in the browser.

Project page: <http://gitgraphjs.com/>

## How to start

You have different options to start with the library:

- [Download the latest release](https://github.com/nicoespeon/gitgraph.js/releases/latest).
- Clone the repo: `git clone git@github.com:nicoespeon/gitgraph.js.git`.
- Install with [npm](https://www.npmjs.com): `npm install --save gitgraph.js`.
- Install with [Bower](http://bower.io/): `bower install gitgraph.js`.
- Use [the CDNjs hosted lib](https://cdnjs.com/libraries/gitgraph.js).

Production files are available under the `build/` directory.

## Report a bug / Ask for a feature

You found some nasty bug or have a cool feature request? [Just open a new
issue](https://github.com/nicoespeon/gitgraph.js/issues).

Please have a look at the [Issue Guidelines][] from [Nicolas Gallagher][] before
doing so.

[Issue Guidelines]: https://github.com/necolas/issue-guidelines/blob/master/CONTRIBUTING.md
[Nicolas Gallagher]: https://github.com/necolas

## Documentation

The JavaScript source code is documented with [JSDoc](http://usejsdoc.org/).

## Contributing

Editor preferences are available in for [the editor config][] easy use in common
text editors. Read more and download plugins at <http://editorconfig.org>.

[the editor config]: https://github.com/nicoespeon/gitgraph.js/blob/master/.editorconfig

The project uses [Grunt](http://gruntjs.com) with convenient methods for our
workflow. It's how we lint our code, run tests, generate documentation, etc. To
use it, install the required dependencies as directed and then run the following
Grunt commands.

### Install Grunt

From the command line:

- Install [the necessary local dependencies][] with `npm install`.

[the necessary local dependencies]: https://github.com/nicoespeon/gitgraph.js/blob/master/package.json

When completed, you'll be able to run the various Grunt commands provided from
the command line.

[> Need more information about how to get started with Grunt?](http://gruntjs.com/getting-started)

### Available commands

#### test code - `npm test`

Check source code against [JSHint][] then runs unit tests with [Jasmine][].

[JSHint]: http://www.jshint.com/
[Jasmine]: https://jasmine.github.io/

#### generate documentation - `npm run doc`

Generate source code documentation into `dist/docs/` (not versioned) with
[JSDoc](http://usejsdoc.org/).

#### generate TypeScript Definition - `npm run tsd`

Generate TypeScript Definition into `dist/gitgraph.d.ts` (not versioned).

#### compile a non-versioned release - `npm run dist`

Clean `dist/` directory, lint code, output the minified release into
`dist/gitgraph.min.js` and generate the documentation into `dist/docs/`.

#### compile a new release - `npm run release`

Lint code, output the source and minified releases into `build/` and generate
the official documentation into `docs/`.

#### open a live reload server - `npm start`

For a better code experience, this grunt task opens a live server in your
favorite browser. This server is automatically reloaded when you save a project
file.

Please note that `examples/index.html` is the default file for testing ;)

## Versioning

We use [SemVer](http://semver.org/) as a guideline for our versioning here.

### What does that mean?

Releases will be numbered with the following format:

```
<major>.<minor>.<patch>
```

And constructed with the following guidelines:

- Breaking backward compatibility bumps the `<major>` (and resets the `<minor>`
  and `<patch>`)
- New additions without breaking backward compatibility bump the `<minor>` (and
  reset the `<patch>`)
- Bug fixes and misc. changes bump the `<patch>`

## Authors and contributors

**Nicolas Carlo** - [@nicoespeon](https://twitter.com/nicoespeon) } <http://nicoespeon.com>

**Fabien Bernard** - [@fabien0102](https://twitter.com/fabien0102)

## Copyright and License

Copyright (c) 2013 Nicolas CARLO and Fabien BERNARD under the [MIT license][]

[MIT license]: https://github.com/nicoespeon/gitgraph.js/blob/master/LICENSE.md

[> What does that mean?](http://choosealicense.com/licenses/mit/)
