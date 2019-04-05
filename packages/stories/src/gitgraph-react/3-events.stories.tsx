import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { Gitgraph } from "@gitgraph/react";

import { createFixedHashGenerator } from "../helpers";

storiesOf("gitgraph-react/3. Events", module)
  .add("on commit dot click", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
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
    </Gitgraph>
  ))
  .add("on commit dot mouseover", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const onMouseOver = action("mouse over dot");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOver });
        master.commit({ subject: "World", onMouseOver });
      }}
    </Gitgraph>
  ))
  .add("on commit dot mouseout", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const onMouseOut = action("mouse out dot");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOut });
        master.commit({ subject: "World", onMouseOut });
      }}
    </Gitgraph>
  ))
  .add("on commit message click", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const onMessageClick = action("click on message");

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMessageClick });
        master.commit({ subject: "World", onMessageClick });
      }}
    </Gitgraph>
  ));
