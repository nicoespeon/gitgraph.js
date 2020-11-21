import * as React from "react";
import {
  GitgraphCore,
  Commit,
  Mode,
  Coordinate,
} from "@gitgraph/core";
import { ReactSvgElement } from "./types";
import { Dot } from "./Dot";
import { Tooltip } from "./Tooltip";
import { Arrow } from "./Arrow";
import { Message } from "./Message";
import { Tag } from "./Tag";
import { BranchLabel } from "./BranchLabel";

interface CommitsProps {
  commits: Array<Commit<ReactSvgElement>>;
  commit: Commit<ReactSvgElement>;
  currentCommitOver: Commit<ReactSvgElement> | null;
  gitgraph: GitgraphCore<ReactSvgElement>;
  getWithCommitOffset: (props: any) => Coordinate;
  setTooltip: (val: React.ReactElement<SVGGElement> | null) => void;
  setCurrentCommitOver: (val: Commit<ReactSvgElement> | null) => void;
}

export const CommitComp = (props: CommitsProps) => {
  const {commit, commits, gitgraph} = props;

  const arrows = React.useMemo(() => {
    if (!gitgraph.template.arrow.size) return null;
    const commitRadius = commit.style.dot.size;

    return commit.parents.map((parentHash: string) => {
      return (
        <Arrow
          key={parentHash}
          commits={commits}
          commit={commit}
          gitgraph={gitgraph}
          parentHash={parentHash}
          commitRadius={commitRadius}
        />
      );
    });
  }, [commits, commit, gitgraph]);

  const branchLabels = React.useMemo(() => {
    // @gitgraph/core could compute branch labels into commits directly.
    // That will make it easier to retrieve them, just like tags.
    // TODO: WILL THIS CAUSE A BUG BY BEING IN USEMEMO?
    const branches = Array.from(gitgraph.branches.values());
    return branches.map((branch) => {
      return (
        <BranchLabel
          key={branch.name}
          gitgraph={gitgraph}
          branch={branch}
          commit={commit}
        />
      );
    });
  }, [gitgraph, commit])

  const tags = React.useMemo(() => {
    if (!commit.tags) return null;
    if (gitgraph.isHorizontal) return null;

    return commit.tags.map((tag) =>
      <Tag
        key={`${commit.hashAbbrev}-${tag.name}`}
        commit={commit}
        tag={tag}
      />,
    );
  }, [commit, gitgraph])

  const { x, y } = props.getWithCommitOffset(commit);

  const shouldRenderTooltip =
    props.currentCommitOver === commit &&
    (props.gitgraph.isHorizontal ||
      (props.gitgraph.mode === Mode.Compact &&
        commit.style.hasTooltipInCompactMode));

  if (shouldRenderTooltip) {
    props.setTooltip(
      <g transform={`translate(${x}, ${y})`}>
        <Tooltip commit={commit}>
          {commit.hashAbbrev} - {commit.subject}
        </Tooltip>
      </g>,
    );
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      <Dot
        commit={commit}
        onMouseOver={() => {
          props.setCurrentCommitOver(commit);
          commit.onMouseOver();
        }}
        onMouseOut={() => {
          props.setCurrentCommitOver(null);
          props.setTooltip(null);
          commit.onMouseOut();
        }}
      />
      {arrows}

      {/* These elements are positionned after component update. */}
      <g transform={`translate(${-x}, 0)`}>
        {
          commit.style.message.display &&
          <Message
            commit={commit}
          />
        }
        {branchLabels}
        {tags}
      </g>
    </g>
  );
}
