// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";

import { createFixedHashGenerator } from "./helpers";
import { createGitgraph, Orientation } from "../gitgraph";

storiesOf("2. Orientations", module)
  .add("vertical reverse", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      orientation: Orientation.VerticalReverse,
    });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);

    return graphContainer;
  })
  .add("horizontal", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      orientation: Orientation.Horizontal,
    });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);
    master.commit();

    return graphContainer;
  })
  .add("horizontal reverse", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      orientation: Orientation.HorizontalReverse,
    });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);
    master.commit();

    return graphContainer;
  });
