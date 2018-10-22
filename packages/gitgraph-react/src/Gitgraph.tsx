import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  Commit,
  Branch,
  Coordinate,
  MergeStyle,
  Mode,
} from "gitgraph-core/lib/index";
import { toSvgPath, arrowSvgPath } from "gitgraph-core/lib/utils";
import Tooltip from "./Tooltip";
import { Dot } from "./Dot";

export interface GitgraphProps {
  options?: GitgraphOptions;
  children: (gitgraph: GitgraphCore<React.ReactNode>) => void;
}

export interface GitgraphState {
  commits: Array<Commit<React.ReactNode>>;
  branchesPaths: Map<Branch<React.ReactNode>, Coordinate[][]>;
  commitMessagesX: number;
  currentCommitOver: Commit<React.ReactNode> | null;
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore<React.ReactNode>;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = {
      commits: [],
      branchesPaths: new Map(),
      commitMessagesX: 0,
      currentCommitOver: null,
    };
    this.gitgraph = new GitgraphCore<React.ReactNode>(props.options);
    this.gitgraph.subscribe(this.onGitgraphCoreRender.bind(this));
  }

  public render() {
    return (
      <svg width={1000} height={1000}>
        {this.renderBranches()}
        {this.renderCommits()}
      </svg>
    );
  }

  public componentDidMount() {
    this.props.children(this.gitgraph);
  }

  private renderBranches() {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier =
      this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;
    return Array.from(this.state.branchesPaths).map(
      ([branch, coordinates], i) => (
        <path
          key={branch.name}
          d={toSvgPath(coordinates, isBezier, this.gitgraph.isVertical)}
          fill="transparent"
          stroke={branch.computedColor}
          strokeWidth={branch.style.lineWidth}
          transform={`translate(${offset}, ${offset})`}
        />
      ),
    );
  }

  private renderCommits() {
    return this.state.commits.map((commit) => (
      <g
        key={commit.hashAbbrev}
        transform={`translate(${commit.x}, ${commit.y})`}
      >
        {/* Dot */}
        {commit.renderDot ? (
          commit.renderDot(commit)
        ) : (
          <Dot
            commit={commit}
            onMouseOver={() => this.onMouseOver(commit)}
            onMouseOut={() => {
              this.setState({ currentCommitOver: null });
              commit.onMouseOut();
            }}
          />
        )}

        {/* Tooltip */}
        {this.state.currentCommitOver === commit && this.renderTooltip(commit)}

        {/* Message */}
        {commit.style.message.display && (
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
        )}

        {/* Arrow */}
        {this.gitgraph.template.arrow.size &&
          commit.parents.map((parentHash) => {
            const parent = this.state.commits.find(
              ({ hash }) => hash === parentHash,
            ) as Commit<React.ReactNode>;
            return this.drawArrow(parent, commit);
          })}
      </g>
    ));
  }

  private renderTooltip(commit: Commit<React.ReactNode>) {
    if (commit.renderTooltip) {
      return commit.renderTooltip(commit);
    }

    return (
      <Tooltip commit={commit}>
        {commit.hashAbbrev} - {commit.subject}
      </Tooltip>
    );
  }

  private onMouseOver(commit: Commit<React.ReactNode>): void {
    if (
      this.gitgraph.mode === Mode.Compact &&
      commit.style.shouldDisplayTooltipsInCompactMode
    ) {
      this.setState({ currentCommitOver: commit });
    }

    commit.onMouseOver();
  }

  private drawArrow(
    parent: Commit<React.ReactNode>,
    commit: Commit<React.ReactNode>,
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
function getMessage(commit: Commit<React.ReactNode>): string {
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

export default Gitgraph;
export * from "gitgraph-core/lib/index";
