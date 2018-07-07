import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, OrientationsEnum } from "../Gitgraph";

storiesOf("Gitgraph orientations", module)
  .add("vertical reverse", () => (
    <Gitgraph options={{ orientation: OrientationsEnum.VerticalReverse }}>
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
    <Gitgraph options={{ orientation: OrientationsEnum.Horizontal }}>
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
    <Gitgraph options={{ orientation: OrientationsEnum.HorizontalReverse }}>
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
