# `@gitgraph/react`

[![version](https://img.shields.io/npm/v/@gitgraph/react.svg?logo=npm)](https://www.npmjs.com/package/@gitgraph/react)
[![Changelog](https://img.shields.io/badge/%F0%9F%93%94-changelog-CD9523.svg)](https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-react/CHANGELOG.md)

Draw pretty git graphs with React.

> This is the React rendering library of [GitGraph.js][gitgraph-repo].

## Get started

> You need to have [npm][get-npm] installed.

Install the package with npm: `npm i --save @gitgraph/react`

Now you can use the `<GitGraph>` component:

```jsx
const { Gitgraph } = require("@gitgraph/react");

function MyComponent() {
  return (
    <Gitgraph>
      {(gitgraph) => {
        // Simulate git commands with Gitgraph API.
        const master = gitgraph.branch("master");
        master.commit("Initial commit");

        const develop = master.branch("develop");
        develop.commit("Add TypeScript");

        const aFeature = develop.branch("a-feature");
        aFeature
          .commit("Make it work")
          .commit("Make it right")
          .commit("Make it fast");

        develop.merge(aFeature);
        develop.commit("Prepare v1");

        master.merge(develop).tag("v1.0.0");
      }}
    </Gitgraph>
  );
}
```

`<MyComponent>` will render the following graph:

![Example of usage][assets-example]

## More examples

[A bunch of scenarios][stories] has been simulated in our Storybook. You can give them a look 👀

[get-npm]: https://www.npmjs.com/get-npm
[gitgraph-repo]: https://github.com/nicoespeon/gitgraph.js/
[stories]: https://github.com/nicoespeon/gitgraph.js/tree/master/packages/stories/src/gitgraph-react/
[assets-example]: https://github.com/nicoespeon/gitgraph.js/blob/master/packages/gitgraph-react/assets/example-usage.png?raw=true
