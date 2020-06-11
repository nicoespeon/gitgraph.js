import { Mode } from "../mode";
import { Commit } from "../commit";
import { Layout } from "../layout";

import { CompactGraphRows } from "./compact";
import { RegularGraphRows } from "./regular";
import { GitamineGraphRows } from "./gitamine";

export { createGraphRows, RegularGraphRows as GraphRows };

function createGraphRows<TNode>(
  mode: Mode | undefined,
  commits: Array<Commit<TNode>>,
  layout: Layout | undefined,
) {
  if (layout === Layout.Gitamine) {
    return new GitamineGraphRows(commits);
  }
  // default layout
  return mode === Mode.Compact
    ? new CompactGraphRows(commits)
    : new RegularGraphRows(commits);
}
