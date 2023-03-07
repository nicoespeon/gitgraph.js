This is a fork of [GitGraph.js](https://github.com/nicoespeon/gitgraph.js)'s core package.

Made changes to take commit info from [DoltHub](https://wwww.dolthub.com) and render graph.

Changes are:

1. in `packages/gitgraph-react/src/BranchLabel.tsx`, changed the branch label font size and position.

2. in `packages/gitgraph-react/src/Commit.tsx`, move the branch label to the right side of the commit hash and message.

3. in `packages/gitgraph-react/src/Gitgraph.tsx`,made multiple changes:

   a. Reverse the branch path paint order, so the left branch path would cover the right one (the left ones have more priority).

   b. the commit message object is given a fixed height, and would not calculate the height by its content to avoid graph rendering bugs (sometimes the commit nodes are positioned before these heights are calculated, which caused overlaps).

   c. make pagination works, not recalculating the position of commits of the previous page.
