import * as React from "react";
import { GitgraphCore, GitgraphOptions, Commit } from "gitgraph-core/lib/index";

export interface GitgraphProps {
  options?: Partial<GitgraphOptions>;
  children: (gitgraph: GitgraphCore) => void;
}

export interface GitgraphState {
  commits: Commit[];
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  private gitgraph: GitgraphCore;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = { commits: [] };
    this.gitgraph = new GitgraphCore({
      onRender: this.onGitgraphCoreRender.bind(this),
      ...(this.props.options || {}),
    });
  }

  public render() {
    return (
      <svg width={1000} height={1000}>
        {this.state.commits.map((commit) => (
          // Commit
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
        ))}
      </svg>
    );
  }

  public componentDidMount() {
    this.props.children(this.gitgraph);
  }

  private onGitgraphCoreRender(commits: Commit[]) {
    this.setState({ commits });
  }
}

export default Gitgraph;
export * from "gitgraph-core/lib/index";
