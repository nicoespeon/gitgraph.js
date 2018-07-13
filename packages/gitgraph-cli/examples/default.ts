import { gitgraph, renderGraph } from "../src";

const master = gitgraph.branch("master");
master.commit("Initial commit");

const develop = gitgraph.branch("develop");
develop.commit("First commit on develop");
master.commit("Another commit on master");
develop.commit("Commit on develop, again");

renderGraph();
