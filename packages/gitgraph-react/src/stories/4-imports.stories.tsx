import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph } from "../Gitgraph";

import simpleGraph from "./import-fixtures/simple-graph";
import deletedBranch from "./import-fixtures/deleted-branch";
import gitflow from "./import-fixtures/gitflow";

storiesOf("4. Imports", module)
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
  ))
  .add("gitflow", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph.import(gitflow);
      }}
    </Gitgraph>
  ));
