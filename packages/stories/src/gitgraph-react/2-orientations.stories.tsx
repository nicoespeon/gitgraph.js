import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Gitgraph, Orientation, TemplateName } from "@gitgraph/react";

import { createFixedHashGenerator } from "../helpers";

storiesOf("gitgraph-react/2. Orientations", module)
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

        // Shouldn't render tags on horizontal mode
        master.tag("v1.0");

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
  ))
  .add("horizontal reverse (commit after merge)", () => (
    <Gitgraph
      options={{
        orientation: Orientation.HorizontalReverse,
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
