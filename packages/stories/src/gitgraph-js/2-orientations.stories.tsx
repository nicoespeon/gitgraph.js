import * as React from "react";
import { storiesOf } from "@storybook/react";
import { createGitgraph, Orientation, TemplateName } from "@gitgraph/js";

import { createFixedHashGenerator, GraphContainer } from "../helpers";

storiesOf("gitgraph-js/2. Orientations", module)
  .add("vertical reverse", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ))
  .add("horizontal", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          orientation: Orientation.Horizontal,
        });

        const master = gitgraph.branch("master").commit("Initial commit");

        // Shouldn't render tags on horizontal mode
        master.tag("v1.0");

        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
        master.commit();
      }}
    </GraphContainer>
  ))
  .add("horizontal reverse", () => (
    <GraphContainer>
      {(graphContainer) => {
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
      }}
    </GraphContainer>
  ))
  .add("horizontal (black arrow)", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          orientation: Orientation.Horizontal,
          template: TemplateName.BlackArrow,
        });

        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
        master.commit();
      }}
    </GraphContainer>
  ))
  .add("horizontal reverse (black arrow)", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          orientation: Orientation.HorizontalReverse,
          template: TemplateName.BlackArrow,
        });

        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
        master.commit();
      }}
    </GraphContainer>
  ));
