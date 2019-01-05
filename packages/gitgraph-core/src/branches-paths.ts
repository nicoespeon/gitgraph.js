import Commit from "./commit";
import Branch from "./branch";
import GitgraphCore, { Coordinate } from "./gitgraph";
import { Template } from "./template";

interface InternalCoordinate extends Coordinate {
  mergeCommit?: boolean;
}

type BranchesPaths3<TNode> = Map<Branch<TNode>, InternalCoordinate[]>;

const DELETED_BRANCH_NAME = "";

function getDeletedBranchInPath<TNode>(
  branchesPaths: BranchesPaths3<TNode>,
): Branch<TNode> | undefined {
  return Array.from(branchesPaths.keys()).find(
    ({ name }) => name === DELETED_BRANCH_NAME,
  );
}

class BranchesPaths2<TNode> {
  private branches: Map<Branch["name"], Branch<TNode>>;
  private gitgraph: GitgraphCore<TNode>;
  private template: Template;

  constructor(
    branches: Map<Branch["name"], Branch<TNode>>,
    gitgraph: GitgraphCore<TNode>,
    template: Template,
  ) {
    this.branches = branches;
    this.gitgraph = gitgraph;
    this.template = template;
  }

  /**
   * Create or update the path of the branch corresponding to given commit.
   *
   * @param branchesPaths Map of all branches paths
   * @param commit Current commit
   * @param firstParentCommit First parent of the commit
   */
  public setBranchPathForCommit(
    branchesPaths: BranchesPaths3<TNode>,
    commit: Commit<TNode>,
    firstParentCommit: Commit<TNode> | undefined,
  ): BranchesPaths3<TNode> {
    if (!commit.branches) {
      return branchesPaths;
    }

    // Sometimes `branchToDisplay` is not computed => fallback on first branch.
    // Some "import" scenarios show that.
    // There might be something to fix here.
    let branch = this.branches.get(
      commit.branchToDisplay || commit.branches[0],
    );

    // Branch was deleted.
    if (!branch) {
      const deletedBranchInPath = getDeletedBranchInPath<TNode>(branchesPaths);

      // NB: may not work properly if there are many deleted branches.
      if (deletedBranchInPath) {
        branch = deletedBranchInPath;
      } else {
        branch = new Branch({
          name: DELETED_BRANCH_NAME,
          gitgraph: this.gitgraph,
          style: this.template.branch,
        });
      }
    }

    const path: Coordinate[] = [];
    const existingBranchPath = branchesPaths.get(branch);
    if (existingBranchPath) {
      path.push(...existingBranchPath);
    } else if (firstParentCommit) {
      // Make branch path starts from parent branch (parent commit).
      path.push({ x: firstParentCommit.x, y: firstParentCommit.y });
    }

    path.push({ x: commit.x, y: commit.y });

    branchesPaths.set(branch, path);
    return branchesPaths;
  }

  /**
   * Insert merge commits points into `branchesPaths`.
   *
   * @example
   *     // Before
   *     [
   *       { x: 0, y: 640 },
   *       { x: 50, y: 560 }
   *     ]
   *
   *     // After
   *     [
   *       { x: 0, y: 640 },
   *       { x: 50, y: 560 },
   *       { x: 50, y: 560, mergeCommit: true }
   *     ]
   *
   * @param commits All commits (with all branches resolved)
   * @param branchesPaths Map of coordinates of each branch
   */
  public branchesPathsWithMergeCommits(
    commits: Array<Commit<TNode>>,
    branchesPaths: BranchesPaths3<TNode>,
  ): BranchesPaths3<TNode> {
    const mergeCommits = commits.filter(({ parents }) => parents.length > 1);

    mergeCommits.forEach((mergeCommit) => {
      const parentOnOriginBranch = commits.find(({ hash }) => {
        return hash === mergeCommit.parents[1];
      });
      if (!parentOnOriginBranch) return;

      const originBranchName = parentOnOriginBranch.refs[0];
      let branch = this.branches.get(originBranchName);

      if (!branch) {
        // Branch may have been deleted.
        const deletedBranchInPath = getDeletedBranchInPath<TNode>(
          branchesPaths,
        );

        if (!deletedBranchInPath) {
          return;
        }

        branch = deletedBranchInPath;
      }

      const lastPoints = [...(branchesPaths.get(branch) || [])];
      branchesPaths.set(branch, [
        ...lastPoints,
        { x: mergeCommit.x, y: mergeCommit.y, mergeCommit: true },
      ]);
    });

    return branchesPaths;
  }
}

export default BranchesPaths2;
