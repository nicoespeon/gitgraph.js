// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";

import { createGitgraph, TemplateName, templateExtend } from "../gitgraph";
import { createFixedHashGenerator } from "./helpers";

storiesOf("5. Templates", module)
  .add("metro", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: TemplateName.Metro,
    });

    const master = gitgraph
      .branch("master")
      .commit("one")
      .commit("two")
      .commit("three");
    const develop = gitgraph.branch("develop").commit("four");
    master.merge(develop);

    return graphContainer;
  })
  .add("blackArrow", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: TemplateName.BlackArrow,
    });

    const master = gitgraph
      .branch("master")
      .commit("one")
      .commit("two")
      .commit("three");

    const develop = gitgraph.branch("develop").commit("four");
    master.commit("five").tag("important");
    master.merge(develop);

    const feat1 = gitgraph.branch("feat1");
    master.commit().tag("v1");
    feat1.commit();

    return graphContainer;
  })
  .add("blackArrow with reverse arrow", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: TemplateName.BlackArrow,
      reverseArrow: true,
    });

    const master = gitgraph
      .branch("master")
      .commit("one")
      .commit("two")
      .commit("three");
    const develop = gitgraph.branch("develop").commit("four");
    master.commit("five");
    master.merge(develop);

    return graphContainer;
  })
  .add("without commit hash", () => {
    const withoutHash = templateExtend(TemplateName.Metro, {
      commit: {
        message: {
          displayHash: false,
        },
      },
    });

    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: withoutHash,
    });

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    return graphContainer;
  })
  .add("without commit author", () => {
    const withoutAuthor = templateExtend(TemplateName.Metro, {
      commit: {
        message: {
          displayAuthor: false,
        },
      },
    });

    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: withoutAuthor,
    });

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    return graphContainer;
  })
  .add("without branch label", () => {
    const withoutBranchLabel = templateExtend(TemplateName.Metro, {
      branch: {
        label: {
          display: false,
        },
      },
    });

    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: withoutBranchLabel,
    });

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    return graphContainer;
  })
  .add("with custom branch labels", () => {
    const customBranchLabels = templateExtend(TemplateName.Metro, {
      branch: {
        label: {
          bgColor: "#ffce52",
          color: "black",
          strokeColor: "#ce9b00",
          borderRadius: 0,
          font: "italic 12pt serif",
        },
      },
    });

    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: customBranchLabels,
    });

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    return graphContainer;
  })
  .add("with custom tags", () => {
    const customTags = templateExtend(TemplateName.Metro, {
      tag: {
        color: "black",
        strokeColor: "#ce9b00",
        bgColor: "#ffce52",
        font: "italic 12pt serif",
        borderRadius: 0,
        pointerWidth: 6,
      },
    });

    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
      template: customTags,
    });

    gitgraph
      .commit("one")
      .tag("v1")
      .commit("two")
      .tag("v2")
      .tag("important")
      .commit("three");

    return graphContainer;
  });
