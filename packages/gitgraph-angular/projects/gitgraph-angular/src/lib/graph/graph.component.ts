import { Component, Input, OnInit } from "@angular/core";

import { toSvgPath } from "gitgraph-core/lib/utils";

import {
  Branch,
  Commit,
  Coordinate,
  GitgraphCore,
  MergeStyle,
} from "gitgraph-core/lib/index";

@Component({
  selector: "gg-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"],
})
export class GraphComponent implements OnInit {
  @Input() public core: GitgraphCore;
  public mergeStyle: MergeStyle;
  public commits: Commit[];
  public branchesPaths: Map<Branch, Coordinate[][]>;
  public commitMessagesX: number;
  public currentCommitOver: Commit | null;
  public offset: number;

  constructor() {}

  public ngOnInit(): void {
    this.offset = this.core.template.commit.dot.size;

    this.core.subscribe(() => {
      const {
        commits,
        branchesPaths,
        commitMessagesX,
      } = this.core.getRenderedData();
      console.log(commits);
      this.commits = commits;
      this.branchesPaths = branchesPaths;
      this.commitMessagesX = commitMessagesX;
    });
  }

  public createD(coordinates: Coordinate[][]): string {
    const isBezier = this.core.template.branch.mergeStyle === MergeStyle.Bezier;

    return toSvgPath(coordinates, isBezier, this.core.isVertical);
  }

  public createTransformString(x: number, y: number): string {
    return `translate(${x}, ${y})`;
  }
}
