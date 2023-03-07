This is the fork of package of [GitGraph.js](https://github.com/nicoespeon/gitgraph.js).

This package makes changes to take commit info from [DoltHub](https://wwww.dolthub.com) in order to render the commit graph.

Changes are:

1. Reversed the commit list order in `packages/gitgraph-core/src/branches-order.ts`, so that the branches set are ordered by oldest to newest:

```ts
[...commits].reverse().forEach((commit, i) => {
  this.branches.add(commit.branchToDisplay);
});
```

2. in `packages/gitgraph-core/src/branches-paths.ts`, change the branch path from a curved line to a straight line.

3. in `packages/gitgraph-core/src/gitgraph.ts`, add all branch names of the current hash to the branches array.

4. in `packages/gitgraph-core/src/template.ts`, changed the commit nodes spacing and branch label border style.

5. in `packages/gitgraph-core/src/user-api/gitgraph-user-api.ts`, reversed the `commitOptionsList` so that it gets the right branch to show.
