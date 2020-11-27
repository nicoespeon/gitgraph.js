import * as React from "react";
import {
  GitgraphCore,
  Commit as CommitCore,
  Mode,
  Coordinate,
} from "@gitgraph/core";
import { ReactSvgElement } from "./types";
import { Dot } from "./Dot";
import { Tooltip } from "./Tooltip";
import { Arrow } from "./Arrow";
import { Message } from "./Message";
import { Tag, TAG_PADDING_X } from "./Tag";
import { BranchLabel } from "./BranchLabel";
import { MutableRefObject } from "react";

interface CommitsProps {
  commits: Array<CommitCore<ReactSvgElement>>;
  commit: CommitCore<ReactSvgElement>;
  currentCommitOver: CommitCore<ReactSvgElement> | null;
  gitgraph: GitgraphCore<ReactSvgElement>;
  getWithCommitOffset: (props: any) => Coordinate;
  setTooltip: (val: React.ReactElement<SVGGElement> | null) => void;
  setCurrentCommitOver: (val: CommitCore<ReactSvgElement> | null) => void;
  commitMessagesX: number;
}

export const Commit = (props: CommitsProps) => {
  const { commit, commits, gitgraph, commitMessagesX } = props;

  /**
   * This _should_ likely be an array, but is not in order to intentionally keep
   *  a potential bug in the codebase that existed prior to Hook-ifying this component
   * @see https://github.com/nicoespeon/gitgraph.js/blob/be9cdf45c7f00970e68e1a4ba579ca7f5c672da4/packages/gitgraph-react/src/Gitgraph.tsx#L197
   * (notice that it's a single `null` value instead of an array
   *
   * The potential bug in question is "what happens when there are more than one
   * branch label rendered? Do they overlap or cause the message X position to be
   * in the wrong position?"
   *
   * TODO: Investigate potential bug outlined above
   */
  const branchLabelRef = React.useRef<SVGGElement>();
  const tagRefs: MutableRefObject<SVGGElement[]> = React.useRef([]);
  // "as unknown as any" needed to avoid `ref` mistypings later. :(
  const messageRef: MutableRefObject<SVGGElement> = (React.useRef<SVGGElement>() as unknown) as any;

  const [branchLabelX, setBranchLabelX] = React.useState(0);
  const [tagXs, setTagXs] = React.useState<number[]>([]);
  const [messageX, setMessageX] = React.useState(0);

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
    const branches = Array.from(gitgraph.branches.values());
    return branches.map((branch) => {
      return (
        <BranchLabel
          key={branch.name}
          gitgraph={gitgraph}
          branch={branch}
          commit={commit}
          ref={branchLabelRef}
          branchLabelX={branchLabelX}
        />
      );
    });
  }, [gitgraph, commit, branchLabelX]);

  const tags = React.useMemo(() => {
    tagRefs.current = [];
    if (!commit.tags) return null;
    if (gitgraph.isHorizontal) return null;

    return commit.tags.map((tag, i) => (
      <Tag
        key={`${commit.hashAbbrev}-${tag.name}`}
        commit={commit}
        tag={tag}
        ref={(r) => (tagRefs.current[i] = r!)}
        tagX={tagXs[i] || 0}
      />
    ));
  }, [commit, gitgraph, tagXs]);

  const { x, y } = props.getWithCommitOffset(commit);

  // positionCommitsElements
  React.useLayoutEffect(() => {
    if (gitgraph.isHorizontal) {
      // Elements don't appear on horizontal mode, yet.
      return;
    }

    const padding = 10;

    let translateX = commitMessagesX;

    if (branchLabelRef.current) {
      setBranchLabelX(translateX);

      // For some reason, one paddingX is missing in BBox width.
      const branchLabelWidth =
        branchLabelRef.current.getBBox().width + BranchLabel.paddingX;
      translateX += branchLabelWidth + padding;
    }

    const allTagXs = tagRefs.current.map((tag) => {
      if (!tag) return 0;

      const tagX = translateX;

      // For some reason, one paddingX is missing in BBox width.
      const tagWidth = tag.getBBox().width + TAG_PADDING_X;
      translateX += tagWidth + padding;

      return tagX;
    });

    setTagXs(allTagXs);

    if (messageRef.current) {
      setMessageX(translateX);
    }
  }, [tagRefs, gitgraph, commitMessagesX]);

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
      <g transform={`translate(${-x}, 0)`}>
        {commit.style.message.display && (
          <Message commit={commit} ref={messageRef} messageX={messageX} />
        )}
        {branchLabels}
        {tags}
      </g>
    </g>
  );
};
