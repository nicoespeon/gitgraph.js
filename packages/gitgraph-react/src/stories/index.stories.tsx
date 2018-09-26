import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, Mode } from "../Gitgraph";

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
        master.commit().commit();

        const develop = gitgraph.branch("develop");
        develop.commit();

        const feat1 = gitgraph.branch("feat1");
        feat1.commit().commit();

        develop.commit();
        develop.merge(feat1);

        master.commit().commit();
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("multiple merges in master", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit("one").commit("two");

        const develop = gitgraph.branch("develop");
        const feat = gitgraph.branch("feat");
        develop.commit("three").commit("four");
        master.commit("five");
        develop.merge(master);

        master.commit("six");
        develop.commit("seven");
        feat.commit("eight");
        master.merge(feat);
        master.merge(develop);
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
  ))
  .add("commit inner text", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph
          .commit({ subject: "Initial commit", innerText: "1" })
          .commit({ subject: "Another commit", innerText: "2" })
          .commit({ subject: "Do something crazy", innerText: "🙀" });
      }}
    </Gitgraph>
  ));
