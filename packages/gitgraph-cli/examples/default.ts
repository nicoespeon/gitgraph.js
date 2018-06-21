import { gitgraph, renderGraph } from "../src";

gitgraph.branch("master").commit("Initial commit");
gitgraph.branch("develop").commit("First commit on develop");

renderGraph();
