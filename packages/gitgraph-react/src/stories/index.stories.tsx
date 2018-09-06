import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, Mode } from "../Gitgraph";
import importFixture from "./import-fixture";

storiesOf("Gitgraph", module)
  .add("default", () => (
    <Gitgraph>
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
  .add("import", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph.import(importFixture);
      }}
    </Gitgraph>
  ))
  .add("stop on last commit", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        const feat = gitgraph.branch("feat");
        feat.commit();
        master.commit("five");
        develop.commit("six");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("commit after merge", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");
        const develop = gitgraph.branch("develop").commit("four");
        master.commit("five");
        develop.commit("six");
        master.merge(develop);
        develop.commit("seven");
      }}
    </Gitgraph>
  ))
  .add("multiple merges", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit("one").commit("two");
        const dev = gitgraph.branch("dev");
        const feat = gitgraph.branch("feat");
        dev.commit("three").commit("four");
        master.commit("five");
        dev.merge(master);
        master.commit("six");
        dev.commit("seven");
        feat.commit("eight");
        master.merge(feat);
        master.merge(dev);
      }}
    </Gitgraph>
  ))
  .add("tags", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit("one");
        master.tag("v1.0");
        master.commit({
          subject: "two",
          tag: "v2.0",
        });
      }}
    </Gitgraph>
  ))
  .add("branch colors", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("one");
        const develop = gitgraph.branch("develop").commit("two");
        const feat1 = gitgraph.branch("feat1").commit("three");
        const feat2 = gitgraph.branch("feat2").commit("four");
        master.commit("five");
        develop.commit("six");
        feat1.commit("seven");
        feat2.commit("height");
      }}
    </Gitgraph>
  ))
  .add("compact mode", () => (
    <Gitgraph options={{ mode: Mode.Compact }}>
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit()
          .commit();

        // Branch has more commits.
        const develop = gitgraph.branch("develop").commit();
        master.merge(develop);

        // Branch & master have as much commits.
        const feat1 = gitgraph.branch("feat1").commit();
        master.commit();
        master.merge(feat1);

        // Master has more commits.
        const feat2 = gitgraph.branch("feat2").commit();
        master.commit().commit();
        master.merge(feat2);
      }}
    </Gitgraph>
  ));
