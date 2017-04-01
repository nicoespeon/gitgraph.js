/// <reference path="../dist/gitgraph.d.ts" />

const g: GitGraph = new GitGraph({});
const master:GitGraph.Branch = g.branch('toto');
g.commit('coucou')