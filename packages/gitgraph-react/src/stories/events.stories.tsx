import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph } from "gitgraph-react/src/Gitgraph";
import { Commit } from "gitgraph-core";

storiesOf("Gitgraph events", module)
  .add("on commit click", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onClick(commit: Commit) {
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
  .add("on commit mouseover", () => (
    <Gitgraph>
      {(gitgraph) => {
        function onMouseOver(commit: Commit) {
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
        function onMouseOut(commit: Commit) {
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
