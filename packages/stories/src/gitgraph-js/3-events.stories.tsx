import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { createGitgraph } from "@gitgraph/js";

import { createFixedHashGenerator, GraphContainer } from "../helpers";

storiesOf("gitgraph-js/3. Events", module)
  .add("on commit dot click", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        const onClick = action("click on dot");

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          onClick,
        });
        master.commit({
          subject: "World",
          onClick,
        });
      }}
    </GraphContainer>
  ))
  .add("on commit dot mouseover", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        const onMouseOver = action("mouse over dot");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOver });
        master.commit({ subject: "World", onMouseOver });
      }}
    </GraphContainer>
  ))
  .add("on commit dot mouseout", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        const onMouseOut = action("mouse out dot");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOut });
        master.commit({ subject: "World", onMouseOut });
      }}
    </GraphContainer>
  ))
  .add("on commit message click", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        const onMessageClick = action("click on message");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMessageClick });
        master.commit({ subject: "World", onMessageClick });
      }}
    </GraphContainer>
  ));
