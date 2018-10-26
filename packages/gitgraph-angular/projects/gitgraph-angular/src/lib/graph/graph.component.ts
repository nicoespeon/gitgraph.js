import { Component, OnInit, Input } from "@angular/core";

import {
  GitgraphCore,
  MergeStyle,
  Commit,
  Branch,
  Coordinate,
} from "gitgraph-core/lib/index";

@Component({
  selector: "gg-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"],
})
export class GraphComponent implements OnInit {
  @Input() public core: GitgraphCore;
  public offset: number;
  public mergeStyle: MergeStyle;
  public commits: Commit[];
  public branchesPaths: Map<Branch, Coordinate[][]>;
  public commitMessagesX: number;
  public currentCommitOver: Commit | null;

  constructor() {}

  public ngOnInit(): void {
    this.offset = this.core.template.commit.dot.size;
    const isBezier = this.core.template.branch.mergeStyle === MergeStyle.Bezier;

    this.core.subscribe(() => {
      console.log("yay");
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
}
