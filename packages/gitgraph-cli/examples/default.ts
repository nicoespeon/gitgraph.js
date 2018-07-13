import { gitgraph, renderGraph } from "../src";

gitgraph()
  .commit("one")
  .commit("two")
  .commit("three")
  .commit("four")
  .commit("five")
  .commit();

renderGraph();
