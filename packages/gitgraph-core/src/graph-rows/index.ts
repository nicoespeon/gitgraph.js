import { Mode } from "../gitgraph";
import Commit from "../commit";

import CompactGraphRows from "./compact";
import RegularGraphRows from "./regular";

export type GraphRows<TNode> = RegularGraphRows<TNode>;

export function createGraphRows<TNode>(
  mode: Mode | undefined,
  commits: Array<Commit<TNode>>,
) {
  return mode === Mode.Compact
    ? new CompactGraphRows(commits)
    : new RegularGraphRows(commits);
}
