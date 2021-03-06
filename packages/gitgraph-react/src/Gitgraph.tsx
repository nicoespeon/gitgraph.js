import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  GitgraphUserApi,
  Commit as CommitCore,
  MergeStyle,
  Mode,
  Orientation,
  TemplateName,
  templateExtend,
  BranchesPaths,
  Coordinate,
} from "@gitgraph/core";

import { BranchLabel } from "./BranchLabel";
import { Tooltip } from "./Tooltip";
import {
  ReactSvgElement,
  CommitOptions,
  BranchOptions,
  TagOptions,
  MergeOptions,
  Branch,
} from "./types";
import { Commit } from "./Commit";
import { BranchPath } from "./BranchPath";

export {
  Gitgraph,
  GitgraphProps,
  GitgraphState,
  TemplateName,
  templateExtend,
  MergeStyle,
  Mode,
  Orientation,
  CommitOptions,
  BranchOptions,
  TagOptions,
  MergeOptions,
  Branch,
};

type GitgraphProps = GitgraphPropsWithChildren | GitgraphPropsWithGraph;

interface GitgraphPropsWithChildren {
  options?: GitgraphOptions;
  children: (gitgraph: GitgraphUserApi<ReactSvgElement>) => void;
}

interface GitgraphPropsWithGraph {
  graph: GitgraphCore<ReactSvgElement>;
}

function isPropsWithGraph(
  props: GitgraphProps,
): props is GitgraphPropsWithGraph {
  return "graph" in props;
}

interface GitgraphState {
  commits: Array<CommitCore<ReactSvgElement>>;
  branchesPaths: BranchesPaths<ReactSvgElement>;
  commitMessagesX: number;
  // Store a map to replace commits y with the correct value,
  // including the message offset. Allows custom, flexible message height.
  // E.g. {20: 30} means for commit: y=20 -> y=30
  // Offset should be computed when graph is rendered (componentDidUpdate).
  commitYWithOffsets: { [key: number]: number };
  shouldRecomputeOffsets: boolean;
  currentCommitOver: CommitCore<ReactSvgElement> | null;
}

class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore<ReactSvgElement>;
  private $graph = React.createRef<SVGSVGElement>();
  private $commits = React.createRef<SVGGElement>();
  private $tooltip: React.ReactElement<SVGGElement> | null = null;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = {
      commits: [],
      branchesPaths: new Map(),
      commitMessagesX: 0,
      commitYWithOffsets: {},
      shouldRecomputeOffsets: true,
      currentCommitOver: null,
    };
    this.gitgraph = isPropsWithGraph(props)
      ? props.graph
      : new GitgraphCore<ReactSvgElement>(props.options);
    this.gitgraph.subscribe((data) => {
      const { commits, branchesPaths, commitMessagesX } = data;
      this.setState({
        commits,
        branchesPaths,
        commitMessagesX,
        shouldRecomputeOffsets: true,
      });
    });
  }

  public render() {
    return (
      <svg ref={this.$graph}>
        {/* Translate graph left => left-most branch label is not cropped (horizontal) */}
        {/* Translate graph down => top-most commit tooltip is not cropped */}
        <g transform={`translate(${BranchLabel.paddingX}, ${Tooltip.padding})`}>
          {this.renderBranchesPaths()}
          <g ref={this.$commits}>
            {this.state.commits.map((commit) => (
              <Commit
                key={commit.hash}
                commits={this.state.commits}
                commit={commit}
                currentCommitOver={this.state.currentCommitOver}
                setCurrentCommitOver={this.setCurrentCommitOver.bind(this)}
                gitgraph={this.gitgraph}
                getWithCommitOffset={this.getWithCommitOffset.bind(this)}
                setTooltip={this.setTooltip.bind(this)}
                commitMessagesX={this.state.commitMessagesX}
              />
            ))}
          </g>
          {this.$tooltip}
        </g>
      </svg>
    );
  }

  public componentDidMount() {
    if (isPropsWithGraph(this.props)) return;
    this.props.children(this.gitgraph.getUserApi());
  }

  public componentDidUpdate() {
    if (this.$graph.current) {
      const { height, width } = this.$graph.current.getBBox();
      this.$graph.current.setAttribute(
        "width",
        // Add `Tooltip.padding` so we don't crop the tooltip text.
        // Add `BranchLabel.paddingX` so we don't cut branch label.
        (width + Tooltip.padding + BranchLabel.paddingX).toString(),
      );
      this.$graph.current.setAttribute(
        "height",
        // Add `Tooltip.padding` so we don't crop tooltip text
        // Add `BranchLabel.paddingY` so we don't crop branch label.
        (height + Tooltip.padding + BranchLabel.paddingY).toString(),
      );
    }

    if (!this.state.shouldRecomputeOffsets) return;
    if (!this.$commits.current) return;

    const commits = Array.from(this.$commits.current.children);
    this.setState({
      commitYWithOffsets: this.computeOffsets(commits),
      shouldRecomputeOffsets: false,
    });
  }

  private setCurrentCommitOver(v: CommitCore<ReactSvgElement> | null) {
    this.setState({ currentCommitOver: v });
  }

  private setTooltip(v: React.ReactElement<SVGGElement> | null) {
    this.$tooltip = v;
  }

  private renderBranchesPaths() {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier =
      this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;

    return Array.from(this.state.branchesPaths).map(([branch, coordinates]) => (
      <BranchPath
        key={branch.name}
        gitgraph={this.gitgraph}
        branch={branch}
        coordinates={coordinates}
        getWithCommitOffset={this.getWithCommitOffset.bind(this)}
        isBezier={isBezier}
        offset={offset}
      />
    ));
  }

  private computeOffsets(
    commits: Element[],
  ): GitgraphState["commitYWithOffsets"] {
    let totalOffsetY = 0;

    // In VerticalReverse orientation, commits are in the same order in the DOM.
    const orientedCommits =
      this.gitgraph.orientation === Orientation.VerticalReverse
        ? commits
        : commits.reverse();

    return orientedCommits.reduce<GitgraphState["commitYWithOffsets"]>(
      (newOffsets, commit) => {
        const commitY = parseInt(
          commit.getAttribute("transform")!.split(",")[1].slice(0, -1),
          10,
        );

        const firstForeignObject = commit.getElementsByTagName(
          "foreignObject",
        )[0];
        const customHtmlMessage =
          firstForeignObject && firstForeignObject.firstElementChild;

        let messageHeight = 0;
        if (customHtmlMessage) {
          const height = customHtmlMessage.getBoundingClientRect().height;
          const marginTopInPx =
            window.getComputedStyle(customHtmlMessage).marginTop || "0px";
          const marginTop = parseInt(marginTopInPx.replace("px", ""), 10);

          messageHeight = height + marginTop;
        }

        // Force the height of the foreignObject (browser issue)
        if (firstForeignObject) {
          firstForeignObject.setAttribute("height", `${messageHeight}px`);
        }

        newOffsets[commitY] = commitY + totalOffsetY;

        // Increment total offset after setting the offset
        // => offset next commits accordingly.
        totalOffsetY += messageHeight;

        return newOffsets;
      },
      {},
    );
  }

  private getWithCommitOffset({ x, y }: Coordinate): Coordinate {
    return { x, y: this.state.commitYWithOffsets[y] || y };
  }
}
