import * as React from "react";
import { GitGraphOptions, Commit } from "gitgraph-core/lib/index";
import GitgraphReact from "./GitgraphReact";

export interface GitgraphProps {
  options?: GitGraphOptions;
  children: (gitgraph: GitgraphReact) => void;
}

export interface GitgraphState {
  commits: Commit[];
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  private gitgraph: GitgraphReact;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = { commits: [] };
    this.gitgraph = new GitgraphReact(this.props.options || {}, this);
  }

  public render() {
    return (
      <ul>
        {this.state.commits.map((commit) => (
          <li>[{commit.refs.join(", ")}] {commit.subject}</li>
        ))}
      </ul>
    );
  }

  public componentDidMount() {
    this.props.children(this.gitgraph);
  }
}

export default Gitgraph;
export { Branch } from "gitgraph-core/lib/branch";
