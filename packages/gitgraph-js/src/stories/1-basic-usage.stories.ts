// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";

import { createFixedHashGenerator } from "./helpers";
import { createGitgraph } from "../gitgraph";

storiesOf("1. Basic usage", module)
  .add("default", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);

    return graphContainer;
  })
  .add("stop on last commit", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("develop");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    return graphContainer;
  })
  .add("commit after merge", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph
      .branch("master")
      .commit("one")
      .commit("two")
      .commit("three");
    const develop = gitgraph.branch("develop").commit("four");
    master.commit("five");
    develop.commit("six");
    master.merge(develop);
    develop.commit("seven");

    return graphContainer;
  })
  .add("multiple merges", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master");
    master.commit().commit();

    const develop = gitgraph.branch("develop");
    develop.commit();

    const feat1 = gitgraph.branch("feat1");
    feat1.commit().commit();

    develop.commit();
    develop.merge(feat1);

    master.commit().commit();
    master.merge(develop, "Release new version");

    return graphContainer;
  })
  .add("multiple merges in master", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const develop = gitgraph.branch("develop");
    const feat = gitgraph.branch("feat");
    develop.commit("three").commit("four");
    master.commit("five");
    develop.merge(master);

    master.commit("six");
    develop.commit("seven");
    feat.commit("eight");
    master.merge(feat);
    master.merge(develop);

    return graphContainer;
  })
  .add("merge with fast-forward", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master");
    master.commit();

    // Branch that can be fast-forward on merge.
    const feat1 = gitgraph.branch("feat1");
    feat1
      .commit("First commit of `feat1` branch")
      .commit("Master will fast-forward here");
    master.merge({ branch: feat1, fastForward: true });

    master.commit();

    // Another branch which merge can't be fast-forward.
    const feat2 = gitgraph.branch("feat2");
    feat2.commit().commit();
    master.commit("This commit prevent fast-forward merge");
    master.merge({ branch: feat2, fastForward: true });

    return graphContainer;
  })
  .add("branch colors", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch("master").commit("one");
    const develop = gitgraph.branch("develop").commit("two");
    const feat1 = gitgraph.branch("feat1").commit("three");
    const feat2 = gitgraph.branch("feat2").commit("four");
    master.commit("five");
    develop.commit("six");
    feat1.commit("seven");
    feat2.commit("height");

    return graphContainer;
  })
  .add("branch with style", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const master = gitgraph.branch({
      name: "master",
      style: {
        label: {
          bgColor: "#ffce52",
          color: "black",
          strokeColor: "#ce9b00",
          borderRadius: 0,
          font: "italic 12pt serif",
        },
      },
    });

    master
      .commit()
      .commit()
      .commit();

    gitgraph
      .branch("feat1")
      .commit()
      .commit();

    return graphContainer;
  });
