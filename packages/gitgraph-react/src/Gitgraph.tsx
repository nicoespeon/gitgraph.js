import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  GitgraphUserApi,
  GitgraphCommitOptions,
  GitgraphBranchOptions,
  GitgraphMergeOptions,
  BranchUserApi,
  Commit,
  MergeStyle,
  Mode,
  Orientation,
  TemplateName,
  templateExtend,
  BranchesPaths,
  Coordinate,
  toSvgPath,
  arrowSvgPath,
} from "@gitgraph/core";

import { BranchLabel } from "./BranchLabel";
import { Tooltip } from "./Tooltip";
import { Dot } from "./Dot";

type ReactSvgElement = React.ReactElement<SVGElement>;

type CommitOptions = GitgraphCommitOptions<ReactSvgElement>;
type BranchOptions = GitgraphBranchOptions<ReactSvgElement>;
type MergeOptions = GitgraphMergeOptions<ReactSvgElement>;
type Branch = BranchUserApi<ReactSvgElement>;

export {
  Gitgraph,
  GitgraphProps,
  GitgraphState,
  CommitOptions,
  BranchOptions,
  MergeOptions,
  Branch,
  TemplateName,
  templateExtend,
  MergeStyle,
  Mode,
  Orientation,
};

interface GitgraphProps {
  options?: GitgraphOptions;
  children: (gitgraph: GitgraphUserApi<ReactSvgElement>) => void;
}

interface GitgraphState {
  commits: Array<Commit<ReactSvgElement>>;
  branchesPaths: BranchesPaths<ReactSvgElement>;
  commitMessagesX: number;
  // Store a map to replace commits y with the correct value,
  // including the message offset. Allows custom, flexible message height.
  // E.g. {20: 30} means for commit: y=20 -> y=30
  // Offset should be computed when graph is rendered (componentDidUpdate).
  commitYWithOffsets: { [key: number]: number };
  shouldRecomputeOffsets: boolean;
  currentCommitOver: Commit<ReactSvgElement> | null;
}

class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore<ReactSvgElement>;
  private $graph = React.createRef<SVGSVGElement>();
  private $commits = React.createRef<SVGGElement>();
  private $tooltip: React.ReactElement<SVGGElement> | null = null;
  private branchesLabels: {
    [k: string]: React.RefObject<SVGGElement>;
  } = {};

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
    this.gitgraph = new GitgraphCore<ReactSvgElement>(props.options);
    this.gitgraph.subscribe((data) => {
      const { commits, branchesPaths, commitMessagesX } = data;
      this.setState({ commits, branchesPaths, commitMessagesX });
    });
  }

  public render() {
    return (
      <svg ref={this.$graph}>
        {/* Translate graph left => left-most branch label is not cropped */}
        {/* Translate graph down => top-most commit tooltip is not cropped */}
        <g transform={`translate(${BranchLabel.paddingX}, ${Tooltip.padding})`}>
          {this.renderBranchesPaths()}
          {this.renderBranchesLabels()}
          {this.renderCommits()}
          {this.$tooltip}
        </g>
      </svg>
    );
  }

  public componentDidMount() {
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
    this.translateCommitMessagesWithBranchLabel(commits);
    this.setState({
      commitYWithOffsets: this.computeOffsets(commits),
      shouldRecomputeOffsets: false,
    });
  }

  private renderBranchesPaths() {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier =
      this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;
    return Array.from(this.state.branchesPaths).map(([branch, coordinates]) => (
      <path
        key={branch.name}
        d={toSvgPath(
          coordinates.map((a) => a.map((b) => this.getMessageOffset(b))),
          isBezier,
          this.gitgraph.isVertical,
        )}
        fill="transparent"
        stroke={branch.computedColor}
        strokeWidth={branch.style.lineWidth}
        transform={`translate(${offset}, ${offset})`}
      />
    ));
  }

  private renderBranchesLabels() {
    const branches = Array.from(this.gitgraph.branches.values());
    return branches.map((branch) => {
      const commitHash = this.gitgraph.refs.getCommit(branch.name);
      const commit = this.state.commits.find(({ hash }) => commitHash === hash);

      if (!commit) return null;
      if (!commit.style.message.displayBranch) return null;

      const ref = React.createRef<SVGGElement>();

      // Store the ref to adapt commit message position.
      this.branchesLabels[commit.hashAbbrev] = ref;

      const x = this.gitgraph.isVertical
        ? this.state.commitMessagesX
        : commit.x;

      const commitDotSize = commit.style.dot.size * 2;
      const horizontalMarginTop = 10;
      const y = this.gitgraph.isVertical
        ? this.getMessageOffset(commit).y
        : commit.y + commitDotSize + horizontalMarginTop;

      return (
        <g key={branch.name} ref={ref}>
          <BranchLabel branch={branch} commit={commit} x={x} y={y} />
        </g>
      );
    });
  }

  private renderCommits() {
    return (
      <g ref={this.$commits}>
        {this.state.commits.map((commit) => this.renderCommit(commit))}
      </g>
    );
  }

  private renderCommit(commit: Commit<ReactSvgElement>) {
    const { x, y } = this.getMessageOffset(commit);

    const shouldRenderTooltip =
      this.state.currentCommitOver === commit &&
      (this.gitgraph.isHorizontal ||
        (this.gitgraph.mode === Mode.Compact &&
          commit.style.hasTooltipInCompactMode));

    if (shouldRenderTooltip) {
      this.$tooltip = (
        <g key={commit.hashAbbrev} transform={`translate(${x}, ${y})`}>
          {this.renderTooltip(commit)}
        </g>
      );
    }

    return (
      <g
        key={commit.hashAbbrev}
        // Store commit ID to match branch label. We could use refs instead.
        id={commit.hashAbbrev}
        transform={`translate(${x}, ${y})`}
      >
        {this.renderDot(commit)}
        {commit.style.message.display && this.renderMessage(commit)}
        {this.gitgraph.template.arrow.size && this.renderArrows(commit)}
      </g>
    );
  }

  private renderDot(commit: Commit<ReactSvgElement>) {
    if (commit.renderDot) {
      return commit.renderDot(commit);
    }

    return (
      <Dot
        commit={commit}
        onMouseOver={() => this.onMouseOver(commit)}
        onMouseOut={() => {
          this.setState({ currentCommitOver: null });
          this.$tooltip = null;
          commit.onMouseOut();
        }}
      />
    );
  }

  private onMouseOver(commit: Commit<ReactSvgElement>): void {
    this.setState({ currentCommitOver: commit });
    commit.onMouseOver();
  }

  private renderTooltip(commit: Commit<ReactSvgElement>) {
    if (commit.renderTooltip) {
      return commit.renderTooltip(commit);
    }

    return (
      <Tooltip commit={commit}>
        {commit.hashAbbrev} - {commit.subject}
      </Tooltip>
    );
  }

  private renderMessage(commit: Commit<ReactSvgElement>) {
    if (commit.renderMessage) {
      return (
        <g className="message">
          {commit.renderMessage(commit, this.state.commitMessagesX)}
        </g>
      );
    }

    let body = null;
    if (commit.body) {
      body = (
        <foreignObject width="600" x="10">
          <p>{commit.body}</p>
        </foreignObject>
      );
    }

    const x = this.state.commitMessagesX - commit.x;
    const y = commit.style.dot.size;

    return (
      // Class name is used to retrieve the message. We could use a ref instead.
      <g className="message" transform={`translate(${x}, ${y})`}>
        <text
          alignmentBaseline="central"
          fill={commit.style.message.color}
          style={{ font: commit.style.message.font }}
          onClick={commit.onMessageClick}
        >
          {getMessage(commit)}
        </text>
        {body}
      </g>
    );
  }

  private renderArrows(commit: Commit<ReactSvgElement>) {
    return commit.parents.map((parentHash) => {
      const parent = this.state.commits.find(
        ({ hash }) => hash === parentHash,
      ) as Commit<ReactSvgElement>;

      return this.drawArrow(parent, commit);
    });
  }

  private drawArrow(parent: Coordinate, commit: Commit<ReactSvgElement>) {
    const commitRadius = commit.style.dot.size;

    // Starting point, relative to commit
    const origin = {
      x: this.gitgraph.reverseArrow
        ? commitRadius + (parent.x - commit.x)
        : commitRadius,
      y: this.gitgraph.reverseArrow
        ? commitRadius + (parent.y - commit.y)
        : commitRadius,
    };

    return (
      <g transform={`translate(${origin.x}, ${origin.y})`}>
        <path
          d={arrowSvgPath(this.gitgraph, parent, commit)}
          fill={this.gitgraph.template.arrow.color!}
        />
      </g>
    );
  }

  private translateCommitMessagesWithBranchLabel(commits: Element[]): void {
    commits.forEach((commit) => {
      const branchLabel = this.branchesLabels[commit.id];
      if (!branchLabel || !branchLabel.current) {
        return;
      }

      // Here we rely on the .message class name. A ref might be better.
      const message = commit.getElementsByClassName("message")[0];
      if (!message) return;

      const matches = message
        .getAttribute("transform")!
        .match(/translate\((\d+),\s(\d+)\)/);
      if (!matches) return;

      const [, x, y] = matches.map((a) => parseInt(a, 10));
      // For some reason, 1 padding is not included in BBox total width.
      const branchLabelWidth =
        branchLabel.current.getBBox().width + BranchLabel.paddingX;
      const padding = 10;
      const newX = x + branchLabelWidth + padding;
      message.setAttribute("transform", `translate(${newX}, ${y})`);
    });
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
          commit
            .getAttribute("transform")!
            .split(",")[1]
            .slice(0, -1),
          10,
        );

        const firstForeignObject = commit.getElementsByTagName(
          "foreignObject",
        )[0];
        const customHtmlMessage =
          firstForeignObject && firstForeignObject.firstElementChild;
        const messageHeight = customHtmlMessage
          ? customHtmlMessage.getBoundingClientRect().height
          : 0;

        newOffsets[commitY] = commitY + totalOffsetY;

        // Increment total offset after setting the offset
        // => offset next commits accordingly.
        totalOffsetY += messageHeight;

        return newOffsets;
      },
      {},
    );
  }

  private getMessageOffset({ x, y }: Coordinate): Coordinate {
    return { x, y: this.state.commitYWithOffsets[y] || y };
  }
}

// For now, this piece of logic is here.
// But it might be relevant to move this back to gitgraph-core.
// Ideally, it would be a method of Commit: `commit.message()`.
function getMessage(commit: Commit<ReactSvgElement>): string {
  let message = "";

  if (commit.tags!.length) {
    message += `[${commit.tags!.join(", ")}] `;
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
