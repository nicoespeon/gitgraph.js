import * as React from "react";
import { ReactSvgElement } from "./types";
import { GitgraphCore, Commit, arrowSvgPath } from "@gitgraph/core";

interface ArrowProps {
  commits: Array<Commit<ReactSvgElement>>;
  commit: Commit<ReactSvgElement>;
  gitgraph: GitgraphCore<ReactSvgElement>;
  parentHash: string;
  commitRadius: number;
}

export class Arrow extends React.Component<ArrowProps> {
  public render() {
    const parent = this.props.commits.find(
      ({ hash }) => hash === this.props.parentHash,
    );
    if (!parent) return null;

    // Starting point, relative to commit
    const origin = this.props.gitgraph.reverseArrow
      ? {
          x: this.props.commitRadius + (parent.x - this.props.commit.x),
          y: this.props.commitRadius + (parent.y - this.props.commit.y),
        }
      : { x: this.props.commitRadius, y: this.props.commitRadius };

    return (
      <g transform={`translate(${origin.x}, ${origin.y})`}>
        <path
          d={arrowSvgPath(this.props.gitgraph, parent, this.props.commit)}
          fill={this.props.gitgraph.template.arrow.color!}
        />
      </g>
    );
  }
}
