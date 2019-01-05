import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph } from "../Gitgraph";
import simpleGraph from "./import-fixtures/simple-graph";
import deletedBranch from "./import-fixtures/deleted-branch";

storiesOf("Gitgraph imports", module)
  .add("simple graph", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph.import(simpleGraph);
      }}
    </Gitgraph>
  ))
  .add("deleted branch", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph.import(deletedBranch);
      }}
    </Gitgraph>
  ));
