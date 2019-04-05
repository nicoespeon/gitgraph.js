import * as React from "react";
import { storiesOf } from "@storybook/react";
import { createGitgraph, TemplateName, templateExtend } from "@gitgraph/js";

import { createFixedHashGenerator, GraphContainer } from "../helpers";

storiesOf("gitgraph-js/5. Templates", module)
  .add("metro", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ))
  .add("blackArrow", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ))
  .add("blackArrow with reverse arrow", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ))
  .add("without commit hash", () => (
    <GraphContainer>
      {(graphContainer) => {
        const withoutHash = templateExtend(TemplateName.Metro, {
          commit: {
            message: {
              displayHash: false,
            },
          },
        });

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          template: withoutHash,
        });

        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </GraphContainer>
  ))
  .add("without commit author", () => (
    <GraphContainer>
      {(graphContainer) => {
        const withoutAuthor = templateExtend(TemplateName.Metro, {
          commit: {
            message: {
              displayAuthor: false,
            },
          },
        });

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          template: withoutAuthor,
        });

        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </GraphContainer>
  ))
  .add("without branch label", () => (
    <GraphContainer>
      {(graphContainer) => {
        const withoutBranchLabel = templateExtend(TemplateName.Metro, {
          branch: {
            label: {
              display: false,
            },
          },
        });

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          template: withoutBranchLabel,
        });

        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </GraphContainer>
  ))
  .add("with custom branch labels", () => (
    <GraphContainer>
      {(graphContainer) => {
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

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          template: customBranchLabels,
        });

        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </GraphContainer>
  ))
  .add("with custom tags", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ));
