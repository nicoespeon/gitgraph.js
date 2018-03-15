# Gitgraph v2 − What we want to achieve

## 🥞 Stack

- [lerna](https://lernajs.io/) for managing multiple repositories
  - gitgraph-core
  - gitgraph-js
  - gitgraph-react
  - gitgraph-angular
- [rollup](https://rollupjs.org/) for the bundling with a [TypeScript](https://www.typescriptlang.org/) codebase
- [tslint](https://palantir.github.io/tslint/) to lint our codebase
- [husky](https://github.com/typicode/husky) with [lint-staged](https://github.com/okonet/lint-staged) to lint code automatically on commit hooks
- [commitizen](http://commitizen.github.io/cz-cli/) to ensure consistent commits and generate automatic changelogs
- [jest](http://facebook.github.io/jest/) for a delightful test environment

## 🗂 Repositories

### packages/gitgraph-core

The idea is to extract the main logic, without the rendering.

All the API will be defined there: commit, branch, merge, etc. We'll embrace git semantics.

Every actions will produce an internal "state" that will look like the JSON output from [git2json](https://github.com/fabien0102/git2json). This "state" could be exposed through a `gitgraph.log()` method as it would be useful for consumers − e.g. tests.

Ideally, we should consolidate this "state" with graphical information for rendering: column, row, color, message, x, y, onClick…

For the rendering part, it should be pluggable everywhere so we'll use [Rx.js](http://reactivex.io/): the "state" will be a [ReplaySubject](https://github.com/ReactiveX/rxjs/blob/master/doc/subject.md#replaysubject) so we just have to subscribe to it for reactive rendering.

#### Example of usages

```js
// gitgraph-js/index.ts
import GitgraphCore from "gitgraph-core";

export class Gitgraph extends GitgraphCore {
  constructor(options) {
    super(options);
    // all specific options
    this.$el = options.$el || $("#gitgraph");
  }
  
  render() {
    // my awesome render
    this.log().map(...)
  }
}
```

```js
// gitgraph-react/index.tsx
import React from "react";
import GitgraphCore from "gitgraph-core";

export default class Gitgraph extends React.Component {
  constructor(props) {
    super(props);
    this.gitgraph = new GitgraphCore(props.options);
    // Not really sure about this pattern
    this.gitgraph.log$.subscribe(store => this.setState({store}));
    
    if (props.ref) props.ref(this.gitgraph);
  }
  
  render() {}
}
```

### packages/gitgraph-js

The idea here is to never use  `gitgraph-core` directly. We'll bundle it into different rendering engines.

Gitgraph-js will work more or less with the same API than v1: it takes a selector or an `$el` and that's it. We may move from canvas to svg, or use a combination of both if relevant.

#### Example of usages

```js
import Gitgraph from "gitgraph-js";

const git = new GitGraph(); // default to #gitgraph el
const master = git.branch("master");
master.commit().commit();
const develop = git.branch("develop");
develop.commit("hello");

master.merge(develop);
```

### packages/gitgraph-react

With ref:

```js
import React from "react";
import Gitgraph from "gitgraph-react";

export default class MyAwesomeComp extend React.Component {
  componentDidMount() {
    const master = this.gitgraph.branch("master");
    master.commit().commit();
    const develop = git.branch("develop");
    develop.commit("hello");

    master.merge(develop);
  }
  render() {
    return <Gitgraph options={{template: "blackarrow"}} ref={g => this.gitgraph = g} />
  }
}
```

Functional component with children:

```js
import React from "react";
import Gitgraph, {Commit, Branch} from "gitgraph-react";

export default () => 
  <Gitgraph options={{template: "blackarrow"}}>
    <Branch name="master">
      <Commit message="hello" />
      <Commit />
      <Branch name="develop">
        <Commit />
        <Commit />
        <Commit on="master" />
      </Branch>
    </Branch>
  </Gitgraph>
}
```

With git API − declarative mode:

```js
import React from "react";
import Gitgraph, {Commit, Branch, Checkout, Merge} from "gitgraph-react";

export default () => 
  <Gitgraph options={{template: "blackarrow"}}>
    <Branch name="master" />
    <Commit message="hello" />
    <Commit />
    <Branch name="develop" />
    <Commit />
    <Commit />
    <Commit on="master" />
    <Checkout to="master" />
    <Commit /> {/* commit on master */}
    <Merge develop to="master" />
  </Gitgraph>
}
```

Functional component with render props:

```js
import React from "react";
import Gitgraph from "gitgraph-react";

export default () => 
  <Gitgraph options={{template: "blackarrow"}}>
    { gitgraph => {
      const master = gitgraph.branch("master");
      master.commit("hello").commit();
      const develop = gitgraph.branch("develop");
      develop.commit().commit();
      master.commit();
      master.checkout();
      gitgraph.commit();
      master.merge("develop");
    } }
  </Gitgraph>
}
```