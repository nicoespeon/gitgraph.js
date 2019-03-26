// @ts-ignore
import { storiesOf } from "@storybook/html";

import { createGitgraph } from "../Gitgraph";

storiesOf("1. Basic usage", module).add("default", () => {
  const graphContainer = document.createElement("div");

  // @ts-ignore
  const gitgraph = createGitgraph(graphContainer);

  const master = gitgraph.branch("master").commit("Initial commit");
  const develop = gitgraph.branch("develop");
  develop.commit("one");
  master.commit("two");
  develop.commit("three");
  master.merge(develop);

  return graphContainer;
});
