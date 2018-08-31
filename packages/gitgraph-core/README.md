![gitgraph.js](/assets/logo/gitgraph-logo.png)

[![Build Status](https://secure.travis-ci.org/nicoespeon/gitgraph.js.png)](http://travis-ci.org/nicoespeon/gitgraph.js)
===========

A JavaScript library to draw pretty git graphs in the browser.

Project page: <http://gitgraphjs.com/>

## How to start

You have different options to start with the library:

* [Download the latest release](https://github.com/nicoespeon/gitgraph.js/releases/latest).
* Clone the repo: `git clone git@github.com:nicoespeon/gitgraph.js.git`.
* Install with [npm](https://www.npmjs.com): `npm install --save gitgraph.js`.
* Install with [Bower](http://bower.io/): `bower install gitgraph.js`.
* Use [the CDNjs hosted lib](https://cdnjs.com/libraries/gitgraph.js).

Production files are available under the `build/` directory.

## Report a bug / Ask for a feature

You found some nasty bug or have a cool feature request? [Just open a new
issue](https://github.com/nicoespeon/gitgraph.js/issues).

Please have a look at the [Issue Guidelines][] from [Nicolas Gallagher][] before
doing so.

[issue guidelines]: https://github.com/necolas/issue-guidelines/blob/master/CONTRIBUTING.md
[nicolas gallagher]: https://github.com/necolas

## Documentation

The JavaScript source code is documented with [JSDoc](http://usejsdoc.org/).

### Available commands

#### open a live reload server - `npm start`

For a better code experience, this grunt task opens a live server in your
favorite browser. This server is automatically reloaded when you save a project
file.

Please note that `examples/index.html` is the default file for testing ;)

#### test code - `npm test` | `npm test:watch`

Run unit tests with [Jest](https://facebook.github.io/jest/)

#### build code - `npm run build`

Compile, bundle, uglify, minify code to `/lib`.

## Versioning

We use [SemVer](http://semver.org/) as a guideline for our versioning here.

### What does that mean?

Releases will be numbered with the following format:

```
<major>.<minor>.<patch>
```

And constructed with the following guidelines:

* Breaking backward compatibility bumps the `<major>` (and resets the `<minor>`
  and `<patch>`)
* New additions without breaking backward compatibility bump the `<minor>` (and
  reset the `<patch>`)
* Bug fixes and misc. changes bump the `<patch>`

## Authors and contributors

**Nicolas Carlo** - [@nicoespeon](https://twitter.com/nicoespeon) } <http://nicoespeon.com>

**Fabien Bernard** - [@fabien0102](https://twitter.com/fabien0102)

## Copyright and License

Copyright (c) 2013 Nicolas CARLO and Fabien BERNARD under the [MIT license][]

[mit license]: https://github.com/nicoespeon/gitgraph.js/blob/master/LICENSE.md

[> What does that mean?](http://choosealicense.com/licenses/mit/)
