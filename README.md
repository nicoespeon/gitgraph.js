![GitGraph.js](/assets/logo/gitgraph-logo.png)

A JavaScript library to draw pretty git graphs.

---

👋 **[Help! The project is looking for maintainers!](https://github.com/nicoespeon/gitgraph.js/issues/328)**

[![Build Status](https://travis-ci.org/nicoespeon/gitgraph.js.svg?branch=master)](https://travis-ci.org/nicoespeon/gitgraph.js)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)][license]
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Join the chat at https://gitter.im/gitgraphjs/community](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gitgraphjs/community?utm_source=badge&utm_medium=badge&utm_content=badge)

## Getting started

GitGraph.js codebase is a monorepo. Packages are released under `@gitgraph/*` scope.

As a user, you're probably interested in one of the rendering libraries:

- [gitgraph-js][gitgraph-js]
- [gitgraph-react][gitgraph-react]
- [gitgraph-node][gitgraph-node]

You'll find usage details in their README.

As a contributor, you might be interested in checking out [gitgraph-core][gitgraph-core]. It contains the core logic for rendering libraries to use.

## Running the project locally

Pre-requisites:

- [node.js][node]
- [yarn][yarn]

Setting things up:

1.  Clone the repository: `git clone git@github.com:nicoespeon/gitgraph.js.git`
1.  Install dependencies: `yarn install`
1.  Bootstrap the project: `yarn run lerna bootstrap`

[Lerna][lerna] will install dependencies of all packages and links any cross-dependencies.

Available root-level commands are detailed in `package.json`. You would usually need:

- `yarn test` to run [Jest][jest] unit tests (`yarn test --watch` for watch mode)
- `yarn develop` to start [Storybook][storybook], watching for changes of all packages

> You can also go to specific packages and run available commands detailed in their `package.json`. For example, you could `cd packages/gitgraph-core/` and run `yarn test --watch` to only run tests of this package.
>
> But root-level commands are more convenient!

## Contributing

### [Contributing Guide][contributing]

Read our [contributing guide][contributing] to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to GitGraph.js.

### [Good First Issues][good-first-issues]

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues][good-first-issues] that contain bugs which have a relatively limited scope. This is a great place to get started.

## Versioning

We use [SemVer][semver] as a guideline for our versioning here.

Releases use the following format:

```
<major>.<minor>.<patch>
```

- Breaking changes bump `<major>` (and reset `<minor>` & `<patch>`)
- Backward compatible changes bump `<minor>` (and reset `<patch>`)
- Bug fixes bump `<patch>`

## Authors and contributors

**Nicolas Carlo** - [@nicoespeon](https://twitter.com/nicoespeon) / <https://nicoespeon.com>

**Fabien Bernard** - [@fabien0102](https://twitter.com/fabien0102) / <https://fabien0102.com>

[![0](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/0)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/0)
[![1](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/1)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/1)
[![2](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/2)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/2)
[![3](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/3)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/3)
[![4](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/4)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/4)
[![5](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/5)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/5)
[![6](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/6)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/6)
[![7](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/images/7)](https://sourcerer.io/fame/nicoespeon/nicoespeon/gitgraph.js/links/7)

## Copyright and License

Copyright (c) 2013 Nicolas CARLO and Fabien BERNARD under the [MIT license][license].

💁‍ [What does that mean?](http://choosealicense.com/licenses/mit/)

## Thanks

<a href="https://www.chromaticqa.com/"><img src="https://cdn-images-1.medium.com/letterbox/147/36/50/50/1*oHHjTjInDOBxIuYHDY2gFA.png?source=logoAvatar-d7276495b101---37816ec27d7a" width="120"/></a>

Thanks to [Chromatic](https://www.chromaticqa.com/) for providing the visual testing platform that help us catch visual regressions for the rendering libs.

[node]: https://nodejs.org/
[yarn]: https://yarnpkg.com/
[lerna]: https://github.com/lerna/lerna
[storybook]: https://storybook.js.org/
[jest]: https://jestjs.io/
[semver]: http://semver.org/
[contributing]: CONTRIBUTING.md
[license]: LICENSE.md
[latest-release]: https://github.com/nicoespeon/gitgraph.js/releases/latest
[new-issue]: https://github.com/nicoespeon/gitgraph.js/issues
[good-first-issues]: https://github.com/nicoespeon/gitgraph.js/issues?q=is%3Aissue+is%3Aopen+label%3A%22%3Awave%3A+Good+first+issue%22
[gitgraph-core]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-core
[gitgraph-js]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-js
[gitgraph-react]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-react
[gitgraph-node]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-node
