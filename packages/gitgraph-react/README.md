This is a fork package of React rendering library of [GitGraph.js](https://github.com/nicoespeon/gitgraph.js).

This package makes changes to take commit info from [DoltHub](https://wwww.dolthub.com) in order to render the commit graph.

Changes are:

1. in `packages/gitgraph-react/src/BranchLabel.tsx`, changed the branch label font size and position.

2. in `packages/gitgraph-react/src/Commit.tsx`, move the branch label to the right side of the commit hash and message.

3. in `packages/gitgraph-react/src/Gitgraph.tsx`, there are multiple changes:

   a. Reverse the branch path paint order, so the left branch path would cover the right one (the left ones have more priority).

   b. the commit message object is given a fixed height, and would not calculate the height by its content to avoid graph rendering bugs (sometimes the commit nodes are positioned before these heights are calculated, which caused overlaps).

   c. make pagination work by not recalculating the position of commits of the previous page.
