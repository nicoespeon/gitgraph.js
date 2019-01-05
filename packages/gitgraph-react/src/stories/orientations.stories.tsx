import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, Orientation } from "../Gitgraph";

storiesOf("2. Orientations", module)
  .add("vertical reverse", () => (
    <Gitgraph options={{ orientation: Orientation.VerticalReverse }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("horizontal", () => (
    <Gitgraph options={{ orientation: Orientation.Horizontal }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
        master.commit();
      }}
    </Gitgraph>
  ))
  .add("horizontal reverse", () => (
    <Gitgraph options={{ orientation: Orientation.HorizontalReverse }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        develop.commit("three");
        master.merge(develop);
        master.commit();
      }}
    </Gitgraph>
  ));
