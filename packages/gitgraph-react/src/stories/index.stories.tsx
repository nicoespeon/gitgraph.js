import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, Mode, Commit } from "../Gitgraph";
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
  ))
  .add("with render dot", () => {
    const renderDot = (commit: Commit<React.ReactNode>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 71.84 75.33"
        height="30"
        width="30"
      >
        <g fill={commit.style.dot.color} stroke="white" strokeWidth="2">
          <path d="M68.91,35.38c4.08-1.15,3.81-3-.22-3.75-3.1-.7-18.24-5.75-20.71-6.74-2.15-1-4.67-.12-1,3.4,4,3.53,1.36,8.13,2.79,13.47C50.6,44.89,52.06,49,56,55.62c2.09,3.48,1.39,6.58-1.42,6.82-1.25.28-3.39-1.33-3.33-3.82h0L44.68,43.79c1.79-1.1,2.68-3,2-4.65s-2.5-2.29-4.46-1.93l-1.92-4.36a3.79,3.79,0,0,0,1.59-4.34c-.62-1.53-2.44-2.27-4.37-2L36,22.91c1.65-1.12,2.46-3,1.83-4.52a3.85,3.85,0,0,0-4.37-1.95c-.76-1.68-2.95-6.89-4.89-10.73C26.45,1.3,20.61-2,16.47,1.36c-5.09,4.24-1.46,9-6.86,12.92l2.05,5.35a18.58,18.58,0,0,0,2.54-2.12c1.93-2.14,3.28-6.46,3.28-6.46s1-4,2.2-.57c1.48,3.15,16.59,47.14,16.59,47.14a1,1,0,0,0,0,.11c.37,1.48,5.13,19,19.78,17.52,4.38-.52,6-1.1,9.14-3.83,3.49-2.71,5.75-6.08,5.91-12.62.12-4.67-6.22-12.62-5.81-17S66.71,36,68.91,35.38Z" />
          <path d="M2.25,14.53A28.46,28.46,0,0,1,0,17.28s3,4.75,9.58,3a47.72,47.72,0,0,0-1.43-5A10.94,10.94,0,0,1,2.25,14.53Z" />
        </g>
      </svg>
    );

    return (
      <Gitgraph>
        {(gitgraph) => {
          gitgraph
            .commit({ subject: "Initial commit" })
            .commit({ subject: "Another commit" })
            .commit({
              subject: "Do something crazy",
              renderDot,
            });

          gitgraph
            .branch("dev")
            .commit({
              subject: "Oh my god",
              renderDot,
            })
            .commit({
              subject: "This is a saxo!",
              renderDot,
            });
        }}
      </Gitgraph>
    );
  });
