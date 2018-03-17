import { Component } from "react";
import { GitGraph as GitGraphCore, GitGraphOptions } from "gitgraph-core/lib/index";

/**
 * Implementation of gitgraph-core for react
 *
 * It simply update the state of the component on each render.
 */
export class GitgraphReact extends GitGraphCore {
  private component: Component;

  constructor(options: GitGraphOptions, component: Component) {
    super(options);
    this.component = component;
  }

  public render(): void {
    return this.component.setState({ commits: this.log() });
  }
}

export default GitgraphReact;
