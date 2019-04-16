# `@gitgraph/core`

[![version](https://img.shields.io/npm/v/@gitgraph/core.svg?logo=npm)](https://www.npmjs.com/package/@gitgraph/core)
[![Changelog](https://img.shields.io/badge/%F0%9F%93%94-changelog-CD9523.svg)](https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-core/CHANGELOG.md)

This is the core package of [GitGraph.js][gitgraph-repo]. It contains the main logic for manipulating git-like API and compute the graph that should be rendered.

If you want to use GitGraph.js, you're probably looking for one of the rendering library. They are all listed [at the root level of the monorepo][gitgraph-repo].

If you are a contributor to a rendering library, you'll depend on this package. Read on 🤠

## Why this package?

We wanted to deliver GitGraph.js through different libraries, to fit different usages (e.g. React, Angular, Vanilla JS, Node.js…).

The idea was to extract the common logic, without the rendering part.

All the GitGraph.js API is defined there: commit, branch, merge, etc. It embraces git semantics.

## Developing a rendering library

A rendering library is a wrapper around `@gitgraph/core`.

It should:

- expose the GitGraph.js API to the user
- subscribe to graph updates to re-render it

How it renders the graph is up to you (e.g. canvas, svg, HTML elements…).

### Examples of usage

A vanilla JS implementation:

```js
import { GitgraphCore } from "@gitgraph/core";

export function createGitgraph(options) {
  const $target = options.$target || document.getElementId("#gitgraph");

  const graphOptions = {
    // Build relevant GitgraphCore options.
  };

  // Instantiate the graph.
  const gitgraph = new GitgraphCore(graphOptions);

  // Subscribe to graph updates.
  const gitgraph.subscribe((data) => {
    render($target, data);
  });

  // Return the GitGraph.js API to the user.
  return gitgraph.getUserApi();
}

function render($target, data) {
  // Do the rendering…
  $target.appendChild(renderGraph(data));
}
```

A React implementation:

```jsx
import React from "react";
import { GitgraphCore } from "@gitgraph/core";

export class Gitgraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Init state.
    };

    // Instantiate the graph.
    this.gitgraph = new GitgraphCore(props.options);

    // Subscribe to graph updates.
    this.gitgraph.subscribe((data) => {
      this.setState(data);
    });
  }

  render() {
    // Do the rendering…
    return <svg>{this.renderGraph()}</svg>;
  }

  componentDidMount() {
    // Pass the GitGraph.js API to the user.
    this.props.children(this.gitgraph.getUserApi());
  }
}
```

## How does it work?

The end-user will be using the rendering library. As we return `gitgraph.getUserApi()`, the user will be able to perform git-like actions (create a branch, commit, merge…).

Every action updates the internal graph. The core library computes the new graph that should be rendered to represent the new state. When it does, it will call its listeners through the `subscribe()` method.

[gitgraph-repo]: https://github.com/nicoespeon/gitgraph.js/
