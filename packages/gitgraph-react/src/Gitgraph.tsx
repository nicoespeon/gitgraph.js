import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  Commit,
  Branch,
  Coordinate,
  MergeStyle,
  Mode,
  Orientation,
} from "gitgraph-core/lib/index";
import { toSvgPath, arrowSvgPath } from "gitgraph-core/lib/utils";
import { Tooltip } from "./Tooltip";
import { Dot } from "./Dot";

export interface GitgraphProps {
  options?: GitgraphOptions;
  children: (gitgraph: GitgraphCore<React.ReactElement<SVGElement>>) => void;
}

export interface GitgraphState {
  commits: Array<Commit<React.ReactElement<SVGElement>>>;
  branchesPaths: Map<Branch<React.ReactElement<SVGElement>>, Coordinate[][]>;
  commitMessagesX: number;
  // Store a map to replace commits y with the correct value,
  // including the message offset. Allows custom, flexible message height.
  // E.g. {20: 30} means for commit: y=20 -> y=30
  // Offset should be computed when graph is rendered (componentDidUpdate).
  commitYWithOffsets: { [key: number]: number };
  shouldRecomputeOffsets: boolean;
  currentCommitOver: Commit<React.ReactElement<SVGElement>> | null;
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore<React.ReactElement<SVGElement>>;
  private $graph = React.createRef<SVGSVGElement>();
  private $commits = React.createRef<SVGGElement>();

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
    this.gitgraph = new GitgraphCore<React.ReactElement<SVGElement>>(
      props.options,
    );
    this.gitgraph.subscribe(this.onGitgraphCoreRender.bind(this));
  }

  public render() {
    return (
      <svg ref={this.$graph}>
        {this.renderBranches()}
        {this.renderCommits()}
      </svg>
    );
  }

  public componentDidMount() {
    this.props.children(this.gitgraph);
  }

  public componentDidUpdate() {
    if (this.$graph.current) {
      const { height, width } = this.$graph.current.getBBox();
      this.$graph.current.setAttribute("width", width.toString());
      this.$graph.current.setAttribute("height", height.toString());
    }

    if (!this.state.shouldRecomputeOffsets) return;
    if (!this.$commits.current) return;

    const commits = this.$commits.current.children;
    this.setState({
      commitYWithOffsets: this.computeOffsets(commits),
      shouldRecomputeOffsets: false,
    });
  }

  private renderBranches() {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier =
      this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;
    return Array.from(this.state.branchesPaths).map(([branch, coordinates]) => (
      <path
        key={branch.name}
        d={toSvgPath(
          coordinates.map((a) => a.map((b) => this.applyMessageOffset(b))),
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

  private renderCommits() {
    return (
      <g ref={this.$commits}>
        {this.state.commits.map((commit) => this.renderCommit(commit))}
      </g>
    );
  }

  private renderCommit(commit: Commit<React.ReactElement<SVGElement>>) {
    const { x, y } = this.applyMessageOffset(commit);

    return (
      <g key={commit.hashAbbrev} transform={`translate(${x}, ${y})`}>
        {this.renderDot(commit)}
        {this.state.currentCommitOver === commit && this.renderTooltip(commit)}
        {commit.style.message.display && this.renderMessage(commit)}
        {this.gitgraph.template.arrow.size && this.renderArrows(commit)}
      </g>
    );
  }

  private renderDot(commit: Commit<React.ReactElement<SVGElement>>) {
    if (commit.renderDot) {
      return commit.renderDot(commit);
    }

    return (
      <Dot
        commit={commit}
        onMouseOver={() => this.onMouseOver(commit)}
        onMouseOut={() => {
          this.setState({ currentCommitOver: null });
          commit.onMouseOut();
        }}
      />
    );
  }

  private renderTooltip(commit: Commit<React.ReactElement<SVGElement>>) {
    if (commit.renderTooltip) {
      return commit.renderTooltip(commit);
    }

    return (
      <Tooltip commit={commit}>
        {commit.hashAbbrev} - {commit.subject}
      </Tooltip>
    );
  }

  private renderMessage(commit: Commit<React.ReactElement<SVGElement>>) {
    if (commit.renderMessage) {
      return commit.renderMessage(commit, this.state.commitMessagesX);
    }

    return (
      <text
        x={this.state.commitMessagesX - commit.x}
        y={commit.style.dot.size}
        alignmentBaseline="central"
        fill={commit.style.message.color}
        style={{ font: commit.style.message.font }}
        onClick={commit.onMessageClick}
      >
        {getMessage(commit)}
      </text>
    );
  }

  private renderArrows(commit: Commit<React.ReactElement<SVGElement>>) {
    return commit.parents.map((parentHash) => {
      const parent = this.state.commits.find(
        ({ hash }) => hash === parentHash,
      ) as Commit<React.ReactElement<SVGElement>>;

      return this.drawArrow(parent, commit);
    });
  }

  private onMouseOver(commit: Commit<React.ReactElement<SVGElement>>): void {
    if (
      this.gitgraph.mode === Mode.Compact &&
      commit.style.shouldDisplayTooltipsInCompactMode
    ) {
      this.setState({ currentCommitOver: commit });
    }

    commit.onMouseOver();
  }

  private drawArrow(
    parent: Commit<React.ReactElement<SVGElement>>,
    commit: Commit<React.ReactElement<SVGElement>>,
  ) {
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

  private computeOffsets(
    commits: HTMLCollection,
  ): GitgraphState["commitYWithOffsets"] {
    let totalOffsetY = 0;

    // In VerticalReverse orientation, commits are in the same order in the DOM.
    const orientedCommits =
      this.gitgraph.orientation === Orientation.VerticalReverse
        ? Array.from(commits)
        : Array.from(commits).reverse();

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

  private applyMessageOffset({ x, y }: Coordinate): Coordinate {
    return { x, y: this.state.commitYWithOffsets[y] || y };
  }

  private onGitgraphCoreRender() {
    const {
      commits,
      branchesPaths,
      commitMessagesX,
    } = this.gitgraph.getRenderedData();
    this.setState({ commits, branchesPaths, commitMessagesX });
  }
}

// For now, this piece of logic is here.
// But it might be relevant to move this back to gitgraph-core.
// Ideally, it would be a method of Commit: `commit.message()`.
function getMessage(commit: Commit<React.ReactElement<SVGElement>>): string {
  let message = "";

  if (commit.style.message.displayBranch && commit.branchToDisplay) {
    message += `[${commit.branchToDisplay}`;
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

export default Gitgraph;
export * from "gitgraph-core/lib/index";
