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
    this.gitgraph = new GitgraphReact(this.props.options || {});
    props.children(this.gitgraph);
    this.state = { commits: this.gitgraph.log() };
  }

  public render() {
    return (
      <ul>
        {this.state.commits.map((commit) => <li>{commit.subject}</li>)}
      </ul>
    );
  }
}

export default Gitgraph;
