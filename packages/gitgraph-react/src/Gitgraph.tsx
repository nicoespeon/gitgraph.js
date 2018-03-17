import * as React from "react";
import { GitGraphOptions, Commit } from "gitgraph-core";
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
    this.gitgraph = new GitgraphReact(this.props.options, this.setState);
  }

  public render() {
    this.props.children(this.gitgraph);
    return (
      <li>
        {this.state.commits.map((commit) => <ul>{commit.subject}</ul>)}
      </li>
    );
  }
}

export default Gitgraph;
