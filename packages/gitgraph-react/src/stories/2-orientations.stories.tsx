import * as React from "react";
import { storiesOf } from "@storybook/react";

import { createFixedHashGenerator } from "./helpers";
import { Gitgraph, Orientation, TemplateName } from "../Gitgraph";

storiesOf("2. Orientations", module)
  .add("vertical reverse", () => (
    <Gitgraph
      options={{
        orientation: Orientation.VerticalReverse,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
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
    <Gitgraph
      options={{
        orientation: Orientation.Horizontal,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
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
    <Gitgraph
      options={{
        orientation: Orientation.HorizontalReverse,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
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
  .add("horizontal (black arrow)", () => (
    <Gitgraph
      options={{
        orientation: Orientation.Horizontal,
        template: TemplateName.BlackArrow,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
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
  .add("horizontal reverse (black arrow)", () => (
    <Gitgraph
      options={{
        orientation: Orientation.HorizontalReverse,
        template: TemplateName.BlackArrow,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
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
  .add("vertical reverse (commit after merge)", () => (
    <Gitgraph
      options={{
        orientation: Orientation.VerticalReverse,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit();
        const dev = gitgraph.branch("dev").commit();
        master.commit();
        master.merge(dev);
        dev.commit();
      }}
    </Gitgraph>
  ));
