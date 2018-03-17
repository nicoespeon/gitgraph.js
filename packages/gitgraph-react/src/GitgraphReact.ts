import { Component } from "react";
import GitgraphCore, { GitGraphOptions } from "gitgraph-core";

/**
 * Implementation of gitgraph-core for react
 *
 * It update `state.commits` of the component on each render.
 */
export class GitgraphReact extends GitgraphCore {
  private setState: Component["setState"];

  constructor(options: GitGraphOptions, setState: Component["setState"]) {
    super(options);
    this.setState = setState;
  }

  public render(): void {
    return this.setState({ commits: this.log() });
  }
}

export default GitgraphReact;
