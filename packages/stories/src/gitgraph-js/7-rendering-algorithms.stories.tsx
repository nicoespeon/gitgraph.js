import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  createGitgraph,
  TemplateName,
  templateExtend,
  Layout,
} from "@gitgraph/js";

import { createFixedHashGenerator, GraphContainer } from "../helpers";

const noLabels = templateExtend(TemplateName.Metro, {
  branch: { label: { display: false } },
});

storiesOf("gitgraph-js/7. Rendering algorithms", module)
  .add("Default", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          layout: Layout.Default,
          template: noLabels,
        });

        const master = gitgraph.branch("master").commit("Initial commit");
        for (let i = 0; i < 4; i++) {
          const branch = gitgraph.branch("b" + i);
          branch.commit("something has been done");
          master.merge(branch);
        }
      }}
    </GraphContainer>
  ))
  .add("Gitamine", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          layout: Layout.Gitamine,
          template: noLabels,
        });

        const master = gitgraph.branch("master").commit("Initial commit");
        for (let i = 0; i < 4; i++) {
          const branch = gitgraph.branch("b" + i);
          branch.commit("something has been done");
          master.merge(branch);
        }
      }}
    </GraphContainer>
  ));
