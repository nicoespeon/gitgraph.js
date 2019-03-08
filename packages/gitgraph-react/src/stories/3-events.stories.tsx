import * as React from "react";
import { storiesOf } from "@storybook/react";

import { Gitgraph, CommitOptions } from "../Gitgraph";

storiesOf("3. Events", module)
  .add("on commit dot click", () => (
    <Gitgraph>
      {(gitgraph) => {
        const onClick: CommitOptions["onClick"] = (commit) => {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        };

        const master = gitgraph.branch("master");
        master.commit({
          subject: "Hello",
          onClick,
        });
        master.commit({
          subject: "World",
          onClick,
        });
      }}
    </Gitgraph>
  ))
  .add("on commit message click", () => (
    <Gitgraph>
      {(gitgraph) => {
        const onMessageClick: CommitOptions["onMessageClick"] = (commit) => {
          alert(`Commit ${commit.hashAbbrev} clicked: "${commit.subject}"`);
        };

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMessageClick });
        master.commit({ subject: "World", onMessageClick });
      }}
    </Gitgraph>
  ))
  .add("on commit dot mouseover", () => (
    <Gitgraph>
      {(gitgraph) => {
        const onMouseOver: CommitOptions["onMouseOver"] = (commit) => {
          alert(
            `Mouse is over commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        };

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOver });
        master.commit({ subject: "World", onMouseOver });
      }}
    </Gitgraph>
  ))
  .add("on commit dot mouseout", () => (
    <Gitgraph>
      {(gitgraph) => {
        const onMouseOut: CommitOptions["onMouseOut"] = (commit) => {
          alert(
            `Mouse is out commit ${commit.hashAbbrev}: "${commit.subject}"`,
          );
        };

        const master = gitgraph.branch("master");
        master.commit({ subject: "Hello", onMouseOut });
        master.commit({ subject: "World", onMouseOut });
      }}
    </Gitgraph>
  ));
