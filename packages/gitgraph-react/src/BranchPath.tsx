import * as React from "react";
import { toSvgPath, GitgraphCore, Coordinate, Branch } from "@gitgraph/core";
import { ReactSvgElement } from "./types";
import { ReactElement } from "react";

interface BranchPathProps {
  branch: Branch<ReactElement<SVGElement>>;
  coordinates: Coordinate[][];
  isBezier: boolean;
  offset: number;
  gitgraph: GitgraphCore<ReactSvgElement>;
  getWithCommitOffset: (props: any) => Coordinate;
}

export class BranchPath extends React.Component<BranchPathProps, any> {
  public render() {
    return (
      <path
        d={toSvgPath(
          this.props.coordinates.map((a) =>
            a.map((b) => this.props.getWithCommitOffset(b)),
          ),
          this.props.isBezier,
          this.props.gitgraph.isVertical,
        )}
        fill="none"
        stroke={this.props.branch.computedColor}
        strokeWidth={this.props.branch.style.lineWidth}
        transform={`translate(${this.props.offset}, ${this.props.offset})`}
      />
    );
  }
}
