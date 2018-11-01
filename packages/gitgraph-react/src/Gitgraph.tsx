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
  commitMessageOffset: { [key: number]: number }; // {20: 30} y=20 -> y=30
  currentCommitOver: Commit<React.ReactElement<SVGElement>> | null;
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore<React.ReactElement<SVGElement>>;
  private $commits = React.createRef<SVGGElement>();

  constructor(props: GitgraphProps) {
    super(props);
    this.state = {
      commits: [],
      branchesPaths: new Map(),
      commitMessagesX: 0,
      commitMessageOffset: {},
      currentCommitOver: null,
    };
    this.gitgraph = new GitgraphCore<React.ReactElement<SVGElement>>(
      props.options,
    );
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

  // TODO: refactor following code
  public componentDidUpdate() {
    if (JSON.stringify(this.state.commitMessageOffset) !== "{}") return;
    if (this.$commits.current) {
      const offset: any = {};
      let memoOffset = 0;
      // TODO: test in reverse orientation too
      Array.from(this.$commits.current.children)
        .reverse()
        .forEach((commit) => {
          const y = parseInt(
            commit
              .getAttribute("transform")!
              .split(",")[1]
              .slice(0, -1),
            10,
          );
          const foreignObject = commit.getElementsByTagName("foreignObject");
          let message;
          if (foreignObject.length > 0) {
            message = foreignObject[0];
          }
          const messageHeight = message
            ? message.firstElementChild!.getBoundingClientRect().height
            : 0;

          offset[y] = y + memoOffset;
          memoOffset += messageHeight;
        });
      this.setState({ commitMessageOffset: offset });
    }
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
        {this.state.commits.map((commit, i) => {
          const { x, y } = this.applyMessageOffset(commit);

          return (
            <g key={commit.hashAbbrev} transform={`translate(${x}, ${y})`}>
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
              {this.state.currentCommitOver === commit &&
                this.renderTooltip(commit)}

              {/* Message */}
              {commit.style.message.display && this.renderMessage(commit)}

              {/* Arrow */}
              {this.gitgraph.template.arrow.size &&
                commit.parents.map((parentHash) => {
                  const parent = this.state.commits.find(
                    ({ hash }) => hash === parentHash,
                  ) as Commit<React.ReactElement<SVGElement>>;
                  return this.drawArrow(parent, commit);
                })}
            </g>
          );
        })}
      </g>
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

  private applyMessageOffset({ x, y }: Coordinate): Coordinate {
    return { x, y: this.state.commitMessageOffset[y] || y };
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
