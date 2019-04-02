// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";

import { createGitgraph } from "../gitgraph";

import simpleGraph from "./import-fixtures/simple-graph";
import deletedBranch from "./import-fixtures/deleted-branch";
import gitflow from "./import-fixtures/gitflow";

storiesOf("4. Imports", module)
  .add("simple graph", () => {
    const graphContainer = document.createElement("div");
    const gitgraph = createGitgraph(graphContainer);

    gitgraph.import(simpleGraph);

    return graphContainer;
  })
  .add("deleted branch", () => {
    const graphContainer = document.createElement("div");
    const gitgraph = createGitgraph(graphContainer);

    gitgraph.import(deletedBranch);

    return graphContainer;
  })
  .add("gitflow", () => {
    const graphContainer = document.createElement("div");
    const gitgraph = createGitgraph(graphContainer);

    gitgraph.import(gitflow);

    return graphContainer;
  });
