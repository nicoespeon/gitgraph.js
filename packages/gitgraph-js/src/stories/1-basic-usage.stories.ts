// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";

import { createGitgraph } from "../gitgraph-new";

storiesOf("1. Basic usage", module).add("default", () => {
  const graphContainer = document.createElement("div");

  const gitgraph = createGitgraph(graphContainer);

  const master = gitgraph.branch("master").commit("Initial commit");
  const develop = gitgraph.branch("develop");
  develop.commit("one");
  master.commit("two");
  develop.commit("three");
  master.merge(develop);

  return graphContainer;
});
