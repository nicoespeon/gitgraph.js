import { Component, ContentChild, Input, OnInit, TemplateRef } from "@angular/core";

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
  @ContentChild(TemplateRef) public dot: TemplateRef<any>;

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

  public findParents(commit: Commit): Commit[] {
    return commit.parents.map((parentHash) => {
      return this.commits.find(({ hash }) => hash === parentHash);
    });
  }

  // For now, this piece of logic is here.
  // But it might be relevant to move this back to gitgraph-core.
  // Ideally, it would be a method of Commit: `commit.message()`.
  // tslint:disable:no-non-null-assertion
  public getMessage(commit: Commit): string {
    let message = "";

    if (commit.style.message.displayBranch) {
      message += `[${commit.branches![commit.branches!.length - 1]}`;
      if (commit.tags!.length) {
        message += `, ${commit.tags!.join(", ")}`;
      }
      message += `] `;
    }

    if (commit.style.message.displayHash) {
      message += `${commit.hashAbbrev} `;
    }

    message += commit.subject;

    if (commit.style.message.displayAuthor) {
      message += ` - ${commit.author.name} <${commit.author.email}>`;
    }

    return message;
  }
}
