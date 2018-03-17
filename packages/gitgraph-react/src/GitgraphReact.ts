import { GitGraph as GitGraphCore } from "gitgraph-core/lib/index";

/**
 * Implementation of gitgraph-core for react
 *
 * It update `state.commits` of the component on each render.
 */
export class GitgraphReact extends GitGraphCore {

  public render(): void {
    return;
  }
}

export default GitgraphReact;
