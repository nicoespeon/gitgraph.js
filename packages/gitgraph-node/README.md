**❗ This rendering library is still under development and is not stable.**

# `@gitgraph/node`

[![version](https://img.shields.io/npm/v/@gitgraph/node.svg?logo=npm)](https://www.npmjs.com/package/@gitgraph/node)
[![Changelog](https://img.shields.io/badge/%F0%9F%93%94-changelog-CD9523.svg)](https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-node/CHANGELOG.md)

Draw pretty git graphs in your terminal.

> This is the node.js rendering library of [GitGraph.js][gitgraph-repo].

![Gitgraph node in action](./assets/gitgraph-node-in-action.png)

## Get started

> You need to have [npm][get-npm] installed.

Install the package with npm: `npm i --save @gitgraph/node`

Then, use it in your node.js scripts.

[get-npm]: https://www.npmjs.com/get-npm

## Example of usage

Let's pretend this is your `index.js`:

```js
const { Gitgraph, render } = require("@gitgraph/node");

const gitgraph = new Gitgraph();

// Simulate git commands with Gitgraph API.
const master = gitgraph.branch("master");
master.commit("Set up the project");

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

// Call `render` to log the graph in terminal.
render(gitgraph);
```

Running `node index.js` will produce following output:

![Example usage](./assets/example-usage.png)

[gitgraph-repo]: https://github.com/nicoespeon/gitgraph.js/
