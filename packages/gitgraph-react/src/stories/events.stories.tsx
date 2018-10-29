import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph } from "gitgraph-react/src/Gitgraph";
import { Commit } from "gitgraph-core";

storiesOf("Gitgraph events", module)
  .add("on commit dot click", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onClick(commit: Commit<React.ReactNode>) {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        }

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          body: "First commit",
          onClick,
        });
        master.commit({
          subject: "World",
          body: "Second commit",
          onClick,
        });
      }}
    </Gitgraph>
  ))
  .add("on commit message click", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onMessageClick(commit: Commit<React.ReactNode>) {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        }

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          body: "First commit",
          onMessageClick,
        });
        master.commit({
          subject: "World",
          body: "Second commit",
          onMessageClick,
        });
      }}
    </Gitgraph>
  ))
  .add("on commit mouseover", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onMouseOver(commit: Commit<React.ReactNode>) {
          alert(
            `Mouse is over commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        }

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          body: "First commit",
          onMouseOver,
        });
        master.commit({
          subject: "World",
          body: "Second commit",
          onMouseOver,
        });
      }}
    </Gitgraph>
  ))
  .add("on commit mouseout", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onMouseOut(commit: Commit<React.ReactNode>) {
          alert(
            `Mouse is out commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        }

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          body: "First commit",
          onMouseOut,
        });
        master.commit({
          subject: "World",
          body: "Second commit",
          onMouseOut,
        });
      }}
    </Gitgraph>
  ));
