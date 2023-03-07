import {
  Branch,
  Coordinate,
  GitgraphCore,
  toSvgPath,
} from "@dolthub/gitgraph-core";
import * as React from "react";
import { ReactElement } from "react";
import { ReactSvgElement } from "./types";

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
