import * as React from "react";
import { Gitgraph } from "../Gitgraph";
import { storiesOf } from "@storybook/react";

storiesOf("Hello", module)
  .add("default", () => <Gitgraph>
    {(gitgraph) => {
      gitgraph
        .branch("master")
        .commit("one")
        .commit("two")
        .commit("three");
    }}
  </Gitgraph>);
