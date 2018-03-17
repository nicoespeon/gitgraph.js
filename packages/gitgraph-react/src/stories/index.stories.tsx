import * as React from "react";
import { Gitgraph } from "../Gitgraph";
import { GitgraphReact } from "../GitgraphReact";
import { storiesOf } from "@storybook/react";

storiesOf("Hello", module)
  .add("default", () => <Gitgraph>
    {(gitgraph: GitgraphReact) => {
      gitgraph
        .branch("master")
        .commit("one")
        .commit("two");
    }}
  </Gitgraph>);
