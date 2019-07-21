import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Gitgraph, Mode } from "@gitgraph/react";

import simpleGraph from "../import-fixtures/simple-graph";
import deletedBranch from "../import-fixtures/deleted-branch";
import gitflow from "../import-fixtures/gitflow";
import largeGraph from "../import-fixtures/large-graph";

storiesOf("gitgraph-react/4. Imports", module)
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
  ))
  .add(
    "large graph",
    () => (
      <Gitgraph>
        {(gitgraph) => {
          gitgraph.import(largeGraph);
        }}
      </Gitgraph>
    ),
    // Chromatic can't take a snapshot, it's too big!
    { chromatic: { disable: true } },
  )
  .add("import & compact mode", () => (
    <Gitgraph options={{ mode: Mode.Compact }}>
      {(gitgraph) => {
        gitgraph.import(deletedBranch);
      }}
    </Gitgraph>
  ));
