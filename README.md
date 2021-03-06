![GitGraph.js](/assets/logo/gitgraph-logo.png)

A JavaScript library to draw pretty git graphs.

---

👋 **[Help! The project is looking for maintainers!](https://github.com/nicoespeon/gitgraph.js/issues/328)**

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-41-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

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

## Usage Demo

You can find demo at [Here](https://gitgraphjs.com/stories/)

## Documentation

You can find documentation at [Here](https://gitgraphjs.com/v1/docs/)

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

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://nicoespeon.com/"><img src="https://avatars0.githubusercontent.com/u/1094774?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicolas Carlo</b></sub></a><br /><a href="#ideas-nicoespeon" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=nicoespeon" title="Code">💻</a> <a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Anicoespeon" title="Bug reports">🐛</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=nicoespeon" title="Documentation">📖</a> <a href="https://github.com/nicoespeon/gitgraph.js/pulls?q=is%3Apr+reviewed-by%3Anicoespeon" title="Reviewed Pull Requests">👀</a> <a href="#question-nicoespeon" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://fabien0102.com/"><img src="https://avatars1.githubusercontent.com/u/1761469?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fabien BERNARD</b></sub></a><br /><a href="#ideas-fabien0102" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=fabien0102" title="Code">💻</a> <a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Afabien0102" title="Bug reports">🐛</a> <a href="https://github.com/nicoespeon/gitgraph.js/pulls?q=is%3Apr+reviewed-by%3Afabien0102" title="Reviewed Pull Requests">👀</a> <a href="#question-fabien0102" title="Answering Questions">💬</a> <a href="#design-fabien0102" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/ramittal"><img src="https://avatars2.githubusercontent.com/u/7294159?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rajeev Mittal</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=ramittal" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.hlolli.com/"><img src="https://avatars2.githubusercontent.com/u/6074754?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hlöðver Sigurðsson</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=hlolli" title="Code">💻</a></td>
    <td align="center"><a href="https://singsing.io/blog"><img src="https://avatars1.githubusercontent.com/u/13592559?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Xing Liu</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=S1ngS1ng" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bmaggi"><img src="https://avatars0.githubusercontent.com/u/1917056?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Benoit Maggi</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=bmaggi" title="Documentation">📖</a></td>
    <td align="center"><a href="https://undefined.website/"><img src="https://avatars2.githubusercontent.com/u/11435774?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nemo Nie</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=nemonie" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://mareknarozniak.com/"><img src="https://avatars0.githubusercontent.com/u/8202674?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marek</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=marekyggdrasil" title="Code">💻</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=marekyggdrasil" title="Documentation">📖</a> <a href="#question-marekyggdrasil" title="Answering Questions">💬</a> <a href="#ideas-marekyggdrasil" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/PaulFridrick"><img src="https://avatars1.githubusercontent.com/u/5741022?v=4?s=100" width="100px;" alt=""/><br /><sub><b>PaulFridrick</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=PaulFridrick" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/xmagpie"><img src="https://avatars1.githubusercontent.com/u/9325251?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Konstantin Sorokin</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=xmagpie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/evaliyev"><img src="https://avatars0.githubusercontent.com/u/9257200?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Elchin Valiyev</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=evaliyev" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kohakukun"><img src="https://avatars3.githubusercontent.com/u/4264247?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aura Munoz</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=kohakukun" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/haizz"><img src="https://avatars2.githubusercontent.com/u/3853071?v=4?s=100" width="100px;" alt=""/><br /><sub><b>haizz</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=haizz" title="Code">💻</a> <a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Ahaizz" title="Bug reports">🐛</a> <a href="#ideas-haizz" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/richteambs"><img src="https://avatars1.githubusercontent.com/u/47426581?v=4?s=100" width="100px;" alt=""/><br /><sub><b>richteambs</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Arichteambs" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://edwardwall.me/"><img src="https://avatars0.githubusercontent.com/u/56203203?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edward Wall</b></sub></a><br /><a href="#question-edwardwall" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://kstych.com/"><img src="https://avatars0.githubusercontent.com/u/4062349?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Siddharth Upmanyu</b></sub></a><br /><a href="#question-kstych" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/Symbolk"><img src="https://avatars3.githubusercontent.com/u/14107297?v=4?s=100" width="100px;" alt=""/><br /><sub><b>SymbolK</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3ASymbolk" title="Bug reports">🐛</a> <a href="#question-Symbolk" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/IsaacHub"><img src="https://avatars1.githubusercontent.com/u/20126441?v=4?s=100" width="100px;" alt=""/><br /><sub><b>IsaacHub</b></sub></a><br /><a href="#ideas-IsaacHub" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/enlait"><img src="https://avatars3.githubusercontent.com/u/6122673?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ilya Danilov</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Aenlait" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://brian-gordon.name/"><img src="https://avatars0.githubusercontent.com/u/1331024?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brian Gordon</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Abriangordon" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Andrey-Pavlov"><img src="https://avatars0.githubusercontent.com/u/7976740?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrey Pavlov</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3AAndrey-Pavlov" title="Bug reports">🐛</a> <a href="#ideas-Andrey-Pavlov" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/JackWilliam277"><img src="https://avatars1.githubusercontent.com/u/49405014?v=4?s=100" width="100px;" alt=""/><br /><sub><b>JackWilliam277</b></sub></a><br /><a href="#ideas-JackWilliam277" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/SumNeuron"><img src="https://avatars3.githubusercontent.com/u/22868585?v=4?s=100" width="100px;" alt=""/><br /><sub><b>SumNeuron</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3ASumNeuron" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/kennyeni"><img src="https://avatars3.githubusercontent.com/u/972669?v=4?s=100" width="100px;" alt=""/><br /><sub><b>kennyeni</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Akennyeni" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://alvass.in/"><img src="https://avatars2.githubusercontent.com/u/1497444?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alexander Vasin</b></sub></a><br /><a href="#ideas-alvassin" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/ohjimijimijimi"><img src="https://avatars0.githubusercontent.com/u/766504?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sirio Marchi</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Aohjimijimijimi" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/FeynmanDNA"><img src="https://avatars3.githubusercontent.com/u/26617036?v=4?s=100" width="100px;" alt=""/><br /><sub><b>KYY</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3AFeynmanDNA" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://gaborudvari.com/"><img src="https://avatars0.githubusercontent.com/u/1449353?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gábor Udvari</b></sub></a><br /><a href="#question-gabor-udvari" title="Answering Questions">💬</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/dimaqq/"><img src="https://avatars1.githubusercontent.com/u/662249?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dima Tisnek</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Adimaqq" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://redhat.com/"><img src="https://avatars0.githubusercontent.com/u/540893?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chris Suszynski</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Acardil" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://dolan.bio/"><img src="https://avatars1.githubusercontent.com/u/2917613?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dolan</b></sub></a><br /><a href="#ideas-dolanmiu" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/robrich"><img src="https://avatars0.githubusercontent.com/u/664956?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rob Richardson</b></sub></a><br /><a href="#question-robrich" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/pvigier"><img src="https://avatars2.githubusercontent.com/u/934316?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pierre Vigier</b></sub></a><br /><a href="#ideas-pvigier" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Nebula83"><img src="https://avatars0.githubusercontent.com/u/12481964?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nebula83</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=Nebula83" title="Code">💻</a></td>
    <td align="center"><a href="https://about.me/andreasonny83"><img src="https://avatars0.githubusercontent.com/u/8806300?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrea Sonny</b></sub></a><br /><a href="#infra-andreasonny83" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=andreasonny83" title="Tests">⚠️</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=andreasonny83" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://crutchcorn.dev"><img src="https://avatars0.githubusercontent.com/u/9100169?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Corbin Crutchley</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Acrutchcorn" title="Bug reports">🐛</a> <a href="https://github.com/nicoespeon/gitgraph.js/commits?author=crutchcorn" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/acransac"><img src="https://avatars.githubusercontent.com/u/34621976?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrien Cransac</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/commits?author=acransac" title="Code">💻</a> <a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Aacransac" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/soumyart"><img src="https://avatars.githubusercontent.com/u/20027561?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Soumya Tripathy</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3Asoumyart" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://andrewensley.com"><img src="https://avatars.githubusercontent.com/u/95717?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Ensley</b></sub></a><br /><a href="#ideas-aensley" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/longgt"><img src="https://avatars.githubusercontent.com/u/27258608?v=4?s=100" width="100px;" alt=""/><br /><sub><b>longgt</b></sub></a><br /><a href="#ideas-longgt" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Marty"><img src="https://avatars.githubusercontent.com/u/100658?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Martin McFly</b></sub></a><br /><a href="https://github.com/nicoespeon/gitgraph.js/issues?q=author%3AMarty" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

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
