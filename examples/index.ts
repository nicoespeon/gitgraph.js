/// <reference path="../dist/gitgraph.d.ts" />

// You can use the `d.ts` file to use gitGraph.js in TypeScript.

function generateGraph(): void {
  const config: GitGraph.GitGraphOptions = {
    template: 'blackarrow',
    orientation: 'horizontal'
  };
  const graph = new GitGraph(config);

  const master = graph.branch('master');
  master.commit('This is a commit');
}
