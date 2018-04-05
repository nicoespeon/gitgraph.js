import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  Commit,
  Branch,
  Coordinate,
} from "gitgraph-core/lib/index";
import { Omit, toSvgPath } from "gitgraph-core/lib/utils";

export interface GitgraphProps {
  options?: Omit<GitgraphOptions, "onRender">;
  children: (gitgraph: GitgraphCore) => void;
}

export interface GitgraphState {
  commits: Commit[];
  branchesPaths: Map<Branch, Coordinate[]>;
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = { commits: [], branchesPaths: new Map() };
    this.gitgraph = new GitgraphCore({
      onRender: this.onGitgraphCoreRender.bind(this),
      ...props.options,
    });
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

  /**
   * TODO:
   * - Add branch color
   * - Bezier \o/
   */
  private renderBranches() {
    const offset = this.gitgraph.template.commit.dot.size;
    return Array.from(this.state.branchesPaths).map(([branch, coordinates], i) => (
      <path
        key={branch.name}
        d={toSvgPath(coordinates)}
        fill="transparent"
        stroke={this.gitgraph.template.colors[i]}
        strokeWidth={branch.style.lineWidth}
        transform={`translate(${offset}, ${offset})`}
      />
    ));
  }

  private renderCommits() {
    return this.state.commits.map((commit) => (
      <g key={commit.hashAbbrev} transform={`translate(${commit.x}, ${commit.y})`}>
        {/* Dot */}
        <circle
          cx={commit.style.dot.size}
          cy={commit.style.dot.size}
          r={commit.style.dot.size}
          fill={commit.style.dot.color as string}
        />

        {/* Message */}
        {commit.style.message.display &&
          <text
            x={commit.style.dot.size * 4}
            y={commit.style.dot.size}
          >
            {commit.hashAbbrev} {commit.subject} - {commit.author.name} {`<${commit.author.email}>`}
          </text>
        }
      </g>
    ));
  }

  private onGitgraphCoreRender(commits: Commit[], branchesPaths: Map<Branch, Coordinate[]>) {
    this.setState({ commits, branchesPaths });
  }
}

export default Gitgraph;
export * from "gitgraph-core/lib/index";
