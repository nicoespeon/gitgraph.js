# `@gitgraph/js`

Draw pretty git graphs with vanilla JS.

> This is the vanilla JS rendering library of [GitGraph.js][gitgraph-repo].

## Get started

> You need to have [npm][get-npm] installed.

Install the package with npm: `npm i --save @gitgraph/js`

Now you can use the `<GitGraph>` component:

```js
const { createGitgraph } = require("@gitgraph/js");

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

This code will render the following graph:

![Example of usage](./assets/example-usage.png)

## More examples

[A bunch of scenarios][stories] has been simulated in our Storybook. You can give them a look 👀

[get-npm]: https://www.npmjs.com/get-npm
[gitgraph-repo]: https://github.com/nicoespeon/gitgraph.js/
[stories]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/stories/src/gitgraph-js/
