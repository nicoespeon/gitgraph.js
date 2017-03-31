/// <reference path="../dist/gitgraph.d.ts" />

const g:GitGraph = new GitGraph({orientation: 'vertical'});

const template:GitGraph.Template = new GitGraph.Template({});

g.commit("plop");