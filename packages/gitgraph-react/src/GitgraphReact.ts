import { Component } from "react";
import { GitgraphCore, GitgraphOptions } from "gitgraph-core/lib/index";

/**
 * Implementation of gitgraph-core for react
 *
 * It simply update the state of the component on each render.
 */
export class GitgraphReact extends GitgraphCore {
  private component: Component;

  constructor(options: GitgraphOptions, component: Component) {
    super(options);
    this.component = component;
  }

  public render(): void {
    return this.component.setState({ commits: this.log() });
  }
}

export default GitgraphReact;
