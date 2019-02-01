import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, ReactCommitOptions } from "gitgraph-react/src/Gitgraph";

storiesOf("3. Events", module)
  .add("on commit dot click", () => (
    <Gitgraph>
      {(gitgraph) => {
        const onClick: ReactCommitOptions["onClick"] = (commit) => {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        };

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
        const onMessageClick: ReactCommitOptions["onMessageClick"] = (
          commit,
        ) => {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        };

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
        const onMouseOver: ReactCommitOptions["onMouseOver"] = (commit) => {
          alert(
            `Mouse is over commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        };

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
        const onMouseOut: ReactCommitOptions["onMouseOut"] = (commit) => {
          alert(
            `Mouse is out commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        };

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
