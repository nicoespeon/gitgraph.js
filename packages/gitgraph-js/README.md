# `@gitgraph/js`

[![version](https://img.shields.io/npm/v/@gitgraph/js.svg?logo=npm)](https://www.npmjs.com/package/@gitgraph/js)
[![Changelog](https://img.shields.io/badge/%F0%9F%93%94-changelog-CD9523.svg)](https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-js/CHANGELOG.md)

Draw pretty git graphs with vanilla JS.

> This is the vanilla JS rendering library of [GitGraph.js][gitgraph-repo].

## 👉 Try it with [the online playground][playground]

## Get started

You have 2 options:

1.  [Get GitGraph.js bundle to use directly in your browser](#browser-usage)
1.  [Get GitGraph from npm to use with a JS bundler](#bundler-usage)

### Browser bundle, ready to use

<span id="browser-usage"></span>

Get the bundle from one of the following sources:

- jsDelivr CDN: <https://cdn.jsdelivr.net/npm/@gitgraph/js>
- unpkg CDN: <https://unpkg.com/@gitgraph/js>

Create an `index.html` file and start coding:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load the JS file -->
  <script src="https://cdn.jsdelivr.net/npm/@gitgraph/js"></script>
</head>
<body>
  <!-- DOM element in which we'll mount our graph -->
  <div id="graph-container"></div>

  <!-- Use the `GitgraphJS` global variable to create your graph -->
  <script>
    // Get the graph container HTML element.
    const graphContainer = document.getElementById("graph-container");

    // Instantiate the graph.
    const gitgraph = GitgraphJS.createGitgraph(graphContainer);

    // Simulate git commands with Gitgraph API.
    const master = gitgraph.branch("master");
    master.commit("Initial commit");

    const develop = gitgraph.branch("develop");
    develop.commit("Add TypeScript");

    const aFeature = gitgraph.branch("a-feature");
    aFeature
      .commit("Make it work")
      .commit("Make it right")
      .commit("Make it fast");

    develop.merge(aFeature);
    develop.commit("Prepare v1");

    master.merge(develop).tag("v1.0.0");
  </script>
</body>
</html>
```

Serve your files—with npm, you can run `npx serve .`

You should see the following graph:

![Example of usage][assets-example]

### Usage with a bundler (example with ParcelJS)

<span id="bundler-usage"></span>

> You need to have [npm][get-npm] installed.

Create a new folder for your project and go there: `mkdir your-project && cd your-project`

Initialize your npm project: `npm init -y`

Install the package with npm: `npm i --save @gitgraph/js`

Install Parcel bundler: `npm i --save-dev parcel-bundler`

Now you can use `createGitgraph` to render your graph in a DOM element:

Create an `index.html` file:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- … -->
</head>
<body>
  <!-- DOM element in which we'll mount our graph -->
  <div id="graph-container"></div>

  <!-- This is for ParcelJS bundler -->
  <script src="./index.js"></script>
</body>
</html>
```

Create an `index.js` file:

```js
import { createGitgraph } from "@gitgraph/js";

// Get the graph container HTML element.
const graphContainer = document.getElementById("graph-container");

// Instantiate the graph.
const gitgraph = createGitgraph(graphContainer);

// Simulate git commands with Gitgraph API.
const master = gitgraph.branch("master");
master.commit("Initial commit");

const develop = gitgraph.branch("develop");
develop.commit("Add TypeScript");

const aFeature = gitgraph.branch("a-feature");
aFeature
  .commit("Make it work")
  .commit("Make it right")
  .commit("Make it fast");

develop.merge(aFeature);
develop.commit("Prepare v1");

master.merge(develop).tag("v1.0.0");
```

Add start command in your `package.json`:

```diff
{
  "name": "your-project",
  "version": "1.0.0",
  "scripts": {
+   "start": "parcel index.html"
  }
```

Run `npm start`. You should see the following graph:

![Example of usage][assets-example]

## More examples

[A bunch of scenarios][stories] has been simulated in our Storybook. Give them a look 👀

## If you're coming from `gitgraph.js` package

[Here's a guide to help you migrate][migration-guide] to `@gitgraph/js`.

[playground]: https://codepen.io/nicoespeon/pen/arqPWb?editors=1010
[get-npm]: https://www.npmjs.com/get-npm
[gitgraph-repo]: https://github.com/nicoespeon/gitgraph.js/
[stories]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/stories/src/gitgraph-js/
[migration-guide]: https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-js/MIGRATE_FROM_GITGRAPH.JS.md
[latest-release]: https://github.com/nicoespeon/gitgraph.js/releases/latest
[assets-example]: https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-js/assets/example-usage.png?raw=true
