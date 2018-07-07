import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, templateExtend, TemplateEnum } from "../Gitgraph";

const templateWithoutHash = templateExtend(TemplateEnum.Metro, {
  commit: {
    message: {
      displayHash: false,
    },
  },
});
const templateWithoutAuthor = templateExtend(TemplateEnum.Metro, {
  commit: {
    message: {
      displayAuthor: false,
    },
  },
});
const templateWithoutBranch = templateExtend(TemplateEnum.Metro, {
  commit: {
    message: {
      displayBranch: false,
    },
  },
});

storiesOf("Gitgraph templates", module)
  .add("metro", () => (
    <Gitgraph options={{ template: TemplateEnum.Metro }}>
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
    <Gitgraph options={{ template: TemplateEnum.BlackArrow }}>
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
  ));
