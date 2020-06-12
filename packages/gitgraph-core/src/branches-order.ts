import { Branch } from "./branch";

export { CompareBranchesOrder };

/**
 * Function used to determine the order of the branches in the rendered graph.
 *
 * Returns a value:
 * - < 0 if `branchNameA` should render before `branchNameB`
 * - \> 0 if `branchNameA` should render after `branchNameB`
 * - = 0 if ordering of both branches shouldn't change
 */
type CompareBranchesOrder = (
  branchNameA: Branch["name"],
  branchNameB: Branch["name"],
) => number;
