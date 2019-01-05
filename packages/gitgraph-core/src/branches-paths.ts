import Commit from "./commit";
import Branch from "./branch";
import { CommitStyleBase } from "./template";
import { pick } from "./utils";

export type BranchesPaths<TNode> = Map<Branch<TNode>, Coordinate[][]>;

export interface Coordinate {
  x: number;
  y: number;
}

type InternalBranchesPaths<TNode> = Map<Branch<TNode>, InternalCoordinate[]>;

interface InternalCoordinate extends Coordinate {
  mergeCommit?: boolean;
}

export class BranchesPathsCalculator<TNode> {
  private commits: Array<Commit<TNode>>;
  private branches: Map<Branch["name"], Branch<TNode>>;
  private commitSpacing: CommitStyleBase["spacing"];
  private isGraphVertical: boolean;
  private createDeletedBranch: () => Branch<TNode>;

  constructor(
    commits: Array<Commit<TNode>>,
    branches: Map<Branch["name"], Branch<TNode>>,
    commitSpacing: CommitStyleBase["spacing"],
    isGraphVertical: boolean,
    createDeletedBranch: () => Branch<TNode>,
  ) {
    this.commits = commits;
    this.branches = branches;
    this.commitSpacing = commitSpacing;
    this.isGraphVertical = isGraphVertical;
    this.createDeletedBranch = createDeletedBranch;
  }

  /**
   * Compute branches paths for graph.
   */
  public compute(): BranchesPaths<TNode> {
    const emptyBranchesPaths = new Map<Branch<TNode>, InternalCoordinate[]>();

    const branchesPathsFromCommits = this.commits.reduce((result, commit) => {
      const firstParentCommit = this.commits.find(
        ({ hash }) => hash === commit.parents[0],
      );

      return this.setBranchPathForCommit(result, commit, firstParentCommit);
    }, emptyBranchesPaths);

    return this.smoothBranchesPaths(
      this.branchesPathsWithMergeCommits(branchesPathsFromCommits),
    );
  }

  /**
   * Create or update the path of the branch corresponding to given commit.
   *
   * @param branchesPaths Map of all branches paths
   * @param commit Current commit
   * @param firstParentCommit First parent of the commit
   */
  private setBranchPathForCommit(
    branchesPaths: InternalBranchesPaths<TNode>,
    commit: Commit<TNode>,
    firstParentCommit: Commit<TNode> | undefined,
  ): InternalBranchesPaths<TNode> {
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
        branch = this.createDeletedBranch();
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
   * @param branchesPaths Map of coordinates of each branch
   */
  private branchesPathsWithMergeCommits(
    branchesPaths: InternalBranchesPaths<TNode>,
  ): InternalBranchesPaths<TNode> {
    const mergeCommits = this.commits.filter(
      ({ parents }) => parents.length > 1,
    );

    mergeCommits.forEach((mergeCommit) => {
      const parentOnOriginBranch = this.commits.find(({ hash }) => {
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

  /**
   * Smooth all paths by putting points on each row.
   *
   * @param flatBranchesPaths Map of coordinates of each branch
   */
  private smoothBranchesPaths(
    flatBranchesPaths: InternalBranchesPaths<TNode>,
  ): BranchesPaths<TNode> {
    const branchesPaths = new Map<Branch<TNode>, Coordinate[][]>();

    flatBranchesPaths.forEach((points, branch) => {
      if (points.length <= 1) {
        branchesPaths.set(branch, [points]);
        return;
      }

      // Cut path on each merge commits
      // Coordinate[] -> Coordinate[][]
      if (this.isGraphVertical) {
        points = points.sort((a, b) => (a.y > b.y ? -1 : 1));
      } else {
        points = points.sort((a, b) => (a.x > b.x ? 1 : -1));
      }

      const paths = points.reduce<Coordinate[][]>(
        (mem, point, i) => {
          if (point.mergeCommit) {
            mem[mem.length - 1].push(pick(point, ["x", "y"]));
            if (points[i - 1]) mem.push([points[i - 1]]);
          } else {
            mem[mem.length - 1].push(point);
          }
          return mem;
        },
        [[]],
      );

      // Add intermediate points on each sub paths
      if (this.isGraphVertical) {
        paths.forEach((subPath) => {
          if (subPath.length <= 1) return;
          const firstPoint = subPath[0];
          const lastPoint = subPath[subPath.length - 1];
          const column = subPath[1].x;
          const branchSize =
            Math.round(
              Math.abs(firstPoint.y - lastPoint.y) / this.commitSpacing,
            ) - 1;
          const branchPoints =
            branchSize > 0
              ? new Array(branchSize).fill(0).map((_, i) => ({
                  x: column,
                  y: subPath[0].y - this.commitSpacing * (i + 1),
                }))
              : [];
          const lastSubPaths = branchesPaths.get(branch) || [];
          branchesPaths.set(branch, [
            ...lastSubPaths,
            [firstPoint, ...branchPoints, lastPoint],
          ]);
        });
      } else {
        paths.forEach((subPath) => {
          if (subPath.length <= 1) return;
          const firstPoint = subPath[0];
          const lastPoint = subPath[subPath.length - 1];
          const column = subPath[1].y;
          const branchSize =
            Math.round(
              Math.abs(firstPoint.x - lastPoint.x) / this.commitSpacing,
            ) - 1;
          const branchPoints =
            branchSize > 0
              ? new Array(branchSize).fill(0).map((_, i) => ({
                  y: column,
                  x: subPath[0].x + this.commitSpacing * (i + 1),
                }))
              : [];
          const lastSubPaths = branchesPaths.get(branch) || [];
          branchesPaths.set(branch, [
            ...lastSubPaths,
            [firstPoint, ...branchPoints, lastPoint],
          ]);
        });
      }
    });

    return branchesPaths;
  }
}

export default BranchesPathsCalculator;

/**
 * Return a string ready to use in `svg.path.d` from coordinates
 *
 * @param coordinates Collection of coordinates
 */
export function toSvgPath(
  coordinates: Coordinate[][],
  isBezier: boolean,
  isVertical: boolean,
): string {
  return coordinates
    .map(
      (path) =>
        "M" +
        path
          .map(({ x, y }, i, points) => {
            if (
              isBezier &&
              points.length > 1 &&
              (i === 1 || i === points.length - 1)
            ) {
              const previous = points[i - 1];
              if (isVertical) {
                const middleY = (previous.y + y) / 2;
                return `C ${previous.x} ${middleY} ${x} ${middleY} ${x} ${y}`;
              } else {
                const middleX = (previous.x + x) / 2;
                return `C ${middleX} ${previous.y} ${middleX} ${y} ${x} ${y}`;
              }
            }
            return `L ${x} ${y}`;
          })
          .join(" ")
          .slice(1),
    )
    .join(" ");
}

function getDeletedBranchInPath<TNode>(
  branchesPaths: InternalBranchesPaths<TNode>,
): Branch<TNode> | undefined {
  return Array.from(branchesPaths.keys()).find((branch) => branch.isDeleted());
}
