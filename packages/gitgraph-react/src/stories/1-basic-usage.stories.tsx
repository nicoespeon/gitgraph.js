import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, Mode } from "../Gitgraph";

storiesOf("1. Basic usage", module)
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
        master.merge(develop, "Release new version");
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
  .add("merge with fast-forward", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit();

        // Branch that can be fast-forward on merge.
        const feat1 = gitgraph.branch("feat1");
        feat1.commit().commit();
        master.merge({ branch: feat1, fastForward: true });

        master.commit();

        // Another branch which merge can't be fast-forward.
        const feat2 = gitgraph.branch("feat2");
        feat2.commit().commit();
        master.commit("This commit prevent fast-forward merge");
        master.merge({ branch: feat2, fastForward: true });
      }}
    </Gitgraph>
  ))
  .add("tags", () => (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");

        // Tag on branch
        master.commit().tag("v1.0");

        master.commit();
        master.tag("v1.1");

        master.commit({ tag: "v1.2" });

        // Tag on gitgraph
        master.commit();
        gitgraph.tag("v2.0");
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
  .add("commit dot text", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph
          .commit({ subject: "Initial commit", dotText: "1" })
          .commit({
            subject: "Another commit",
            dotText: "2",
            style: { dot: { font: "italic 12pt Calibri" } },
          })
          .commit({ subject: "Do something crazy", dotText: "🙀" });
      }}
    </Gitgraph>
  ))
  .add("commit message body", () => (
    <Gitgraph>
      {(gitgraph) => {
        gitgraph
          .commit("Initial commit")
          .commit({
            subject: "Commit with a body",
            body:
              "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends.",
          })
          .commit({
            body: "This is to explain the rationale behind this commit.",
          })
          .commit();
      }}
    </Gitgraph>
  ));
