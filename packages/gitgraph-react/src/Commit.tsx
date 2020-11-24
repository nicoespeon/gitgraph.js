import * as React from "react";
import {
  GitgraphCore,
  Commit,
  Mode,
  Coordinate,
} from "@gitgraph/core";
import { CommitElement, ReactSvgElement } from "./types";
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
  initCommitElements: (commit: Commit<ReactSvgElement>) => void;
  commitsElements: {
    [commitHash: string]: CommitElement;
  };
  getWithCommitOffset: (props: any) => Coordinate;
  setTooltip: (val: React.ReactElement<SVGGElement> | null) => void;
  setCurrentCommitOver: (val: Commit<ReactSvgElement> | null) => void;
}

export class CommitComp extends React.Component<CommitsProps, {}> {
  public render() {
    const commit = this.props.commit;
    const { x, y } = this.props.getWithCommitOffset(commit);

    const shouldRenderTooltip =
      this.props.currentCommitOver === commit &&
      (this.props.gitgraph.isHorizontal ||
        (this.props.gitgraph.mode === Mode.Compact &&
          commit.style.hasTooltipInCompactMode));

    if (shouldRenderTooltip) {
      this.props.setTooltip(
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
            this.props.setCurrentCommitOver(commit);
            commit.onMouseOver();
          }}
          onMouseOut={() => {
            this.props.setCurrentCommitOver(null);
            this.props.setTooltip(null);
            commit.onMouseOut();
          }}
        />
        {this.props.gitgraph.template.arrow.size && this.renderArrows(commit)}

        {/* These elements are positionned after component update. */}
        <g transform={`translate(${-x}, 0)`}>
          {
            commit.style.message.display &&
            <Message
              commit={commit}
              commitsElements={this.props.commitsElements}
              initCommitElements={this.props.initCommitElements}
            />
          }
          {this.renderBranchLabels(commit)}
          {this.renderTags(commit)}
        </g>
      </g>
    );
  }

  private renderArrows(commit: Commit<ReactSvgElement>) {
    const commitRadius = commit.style.dot.size;

    return commit.parents.map((parentHash: string) => {
      return (
        <Arrow
          key={parentHash}
          commits={this.props.commits}
          commit={commit}
          gitgraph={this.props.gitgraph}
          parentHash={parentHash}
          commitRadius={commitRadius}
        />
      );
    });
  }


  private renderTags(commit: Commit<ReactSvgElement>) {
    if (!commit.tags) return null;
    if (this.props.gitgraph.isHorizontal) return null;

    return commit.tags.map((tag) =>
      <Tag
        key={`${commit.hashAbbrev}-${tag.name}`}
        commit={commit}
        initCommitElements={this.props.initCommitElements}
        commitsElements={this.props.commitsElements}
        tag={tag}
      />,
    );
  }


  private renderBranchLabels(commit: Commit<ReactSvgElement>) {
    // @gitgraph/core could compute branch labels into commits directly.
    // That will make it easier to retrieve them, just like tags.
    const branches = Array.from(this.props.gitgraph.branches.values());
    return branches.map((branch) => {
      return (
        <BranchLabel
          key={branch.name}
          gitgraph={this.props.gitgraph}
          initCommitElements={this.props.initCommitElements}
          commitsElements={this.props.commitsElements}
          branch={branch}
          commit={commit}
        />
      );
    });
  }
}
