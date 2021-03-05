import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Gitgraph, Mode, Branch } from "@gitgraph/react";
import { GitgraphCore } from "@gitgraph/core";

import { createFixedHashGenerator, hashPrefix } from "../helpers";

storiesOf("gitgraph-react/1. Basic usage", module)
  .add("default", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
  .add("pass graph instance as a prop", () => {
    const graph = new GitgraphCore<React.ReactElement<SVGElement>>({
      generateCommitHash: createFixedHashGenerator(),
    });

    const gitgraph = graph.getUserApi();
    const master = gitgraph
      .branch("master")
      .commit("Initial commit (from graph props)");
    const develop = gitgraph.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);

    return <Gitgraph graph={graph} />;
  })
  .add("stop on last commit", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
  .add("multiple merges from same commit", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit("Initial version");

        const develop = gitgraph.branch("develop").commit("Do something");
        const fix = gitgraph.branch("fix");
        const release = gitgraph.branch("release");
        const feature = develop.branch("feature");
        fix.commit("Bug fixed.");

        release.merge(fix);
        feature.merge(fix);
        develop.merge(fix, "Bugfixes are always merged back to develop");

        master.merge(develop, "New release");
      }}
    </Gitgraph>
  ))
  .add("merge with fast-forward", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit();

        // Branch that can be fast-forward on merge.
        const feat1 = gitgraph.branch("feat1");
        feat1
          .commit("First commit of `feat1` branch")
          .commit("Master will fast-forward here");
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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master");

        // Tag on branch
        master.commit().tag("v1.0").tag("first release");

        master.commit();
        master.tag("v1.1");

        master.commit({ tag: "v1.2" });

        // Tag on gitgraph
        master.commit();
        gitgraph.tag("v2.0");

        // Custom tags
        const customTagStyle = {
          bgColor: "orange",
          strokeColor: "orange",
          borderRadius: 0,
          pointerWidth: 0,
        };
        gitgraph.tag({
          name: "last release",
          style: customTagStyle,
        });

        gitgraph
          .branch("feat1")
          .commit()
          .tag({ name: "something cool", style: customTagStyle });
      }}
    </Gitgraph>
  ))
  .add("branch colors", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
  .add("branch with style", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch({
          name: "master",
          style: {
            label: {
              bgColor: "#ffce52",
              color: "black",
              strokeColor: "#ce9b00",
              borderRadius: 0,
              font: "italic 12pt serif",
            },
          },
        });

        master.commit().commit().commit();

        gitgraph.branch("feat1").commit().commit();
      }}
    </Gitgraph>
  ))
  .add("branch label on every commit", () => (
    <Gitgraph
      options={{
        generateCommitHash: createFixedHashGenerator(),
        branchLabelOnEveryCommit: true,
      }}
    >
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit();
        const develop = gitgraph.branch("develop").commit().commit();
        master.commit();
        gitgraph.branch("feat1").commit().commit();
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("branching from a past commit hash", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit();
        const feat1 = gitgraph.branch("feat1");
        feat1.commit().commit();
        const feat2 = gitgraph.branch({
          name: "feat2",
          from: `${hashPrefix}1`,
        });
        feat2.commit();
      }}
    </Gitgraph>
  ))
  .add("branching from a past reference", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit();

        const feat1 = gitgraph.branch("feat1");
        feat1.commit().commit();

        const feat2 = gitgraph.branch({
          name: "feat2",
          from: master,
        });
        feat2.commit();

        const feat1Part2 = feat1.branch("feat1/part2");
        feat1Part2.commit().commit();
      }}
    </Gitgraph>
  ))
  .add("compact mode", () => (
    <Gitgraph
      options={{
        mode: Mode.Compact,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit().commit();

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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
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
  ))
  .add("custom branch order", () => {
    const branchesOrder = ["feat1", "develop", "master"];

    const compareBranchesOrder = (a: Branch["name"], b: Branch["name"]) =>
      branchesOrder.indexOf(a) - branchesOrder.indexOf(b);

    return (
      <Gitgraph
        options={{
          generateCommitHash: createFixedHashGenerator(),
          compareBranchesOrder,
        }}
      >
        {(gitgraph) => {
          const master = gitgraph.branch("master").commit("Initial commit");
          const develop = gitgraph.branch("develop").commit();
          const feat1 = gitgraph.branch("feat1").commit().commit();
          master.commit();
          develop.commit();
          master.merge(develop);
          feat1.commit();
        }}
      </Gitgraph>
    );
  })
  .add("delete a branch", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        master.checkout();
        develop.delete();
      }}
    </Gitgraph>
  ))
  .add("delete a branch after merging it", () => (
    <Gitgraph options={{ generateCommitHash: createFixedHashGenerator() }}>
      {(gitgraph) => {
        const master = gitgraph.branch("master").commit("Initial commit");
        const develop = gitgraph.branch("develop");
        develop.commit("one");
        master.commit("two");
        master.checkout();
        master.merge(develop);
        develop.delete();
      }}
    </Gitgraph>
  ));
