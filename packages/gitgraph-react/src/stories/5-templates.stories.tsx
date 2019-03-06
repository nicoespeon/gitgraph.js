import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, templateExtend, TemplateName } from "../Gitgraph";

const templateWithoutHash = templateExtend(TemplateName.Metro, {
  commit: {
    message: {
      displayHash: false,
    },
  },
});
const templateWithoutAuthor = templateExtend(TemplateName.Metro, {
  commit: {
    message: {
      displayAuthor: false,
    },
  },
});
const templateWithoutBranch = templateExtend(TemplateName.Metro, {
  commit: {
    message: {
      displayBranch: false,
    },
  },
});

storiesOf("5. Templates", module)
  .add("metro", () => (
    <Gitgraph options={{ template: TemplateName.Metro }}>
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");
        const develop = gitgraph.branch("develop").commit("four");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("blackArrow", () => (
    <Gitgraph options={{ template: TemplateName.BlackArrow }}>
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");

        const develop = gitgraph.branch("develop").commit("four");
        master.commit("five");
        master.merge(develop);

        const feat1 = gitgraph.branch("feat1");
        master.commit();
        feat1.commit();
      }}
    </Gitgraph>
  ))
  .add("blackArrow with reverse arrow", () => (
    <Gitgraph
      options={{ template: TemplateName.BlackArrow, reverseArrow: true }}
    >
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");
        const develop = gitgraph.branch("develop").commit("four");
        master.commit("five");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("without commit hash", () => (
    <Gitgraph options={{ template: templateWithoutHash }}>
      {(gitgraph) => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
  .add("without commit author", () => (
    <Gitgraph options={{ template: templateWithoutAuthor }}>
      {(gitgraph) => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
  .add("without commit branch", () => (
    <Gitgraph options={{ template: templateWithoutBranch }}>
      {(gitgraph) => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
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

    return (
      <Gitgraph options={{ template: customBranchLabels }}>
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .commit("two")
            .commit("three");
        }}
      </Gitgraph>
    );
  });
