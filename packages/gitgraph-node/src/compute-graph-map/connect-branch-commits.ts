import { chain, inRange } from "lodash";

import { GraphLine, GraphSymbol } from "./index";

export default connectBranchCommits;

function connectBranchCommits(branchColor: string, line: GraphLine): GraphLine {
  const branchPaths = chain(line)
    .reduce((point, { value }, index) => {
      if (value === GraphSymbol.Commit) point.push(index);
      return point;
    }, [] as number[])
    .map((point, index, points) => {
      // Duplicate inner points so we can build path chunks.
      // e.g [1, 2] => [[1, 2]] and [1, 2, 2, 3] => [[1, 2], [2, 3]]
      const isAtTheEdge = (index === 0 || index === points.length - 1);
      return isAtTheEdge ? point : [point, point];
    })
    .flatten()
    .chunk(2)
    .filter((path) => path.length === 2)
    .value();

  return line.map((cell, index) =>
    branchPaths.some(isInBranchPath(index))
      ? { value: GraphSymbol.Branch, color: branchColor }
      : cell
  );
}

function isInBranchPath(index: number): (path: number[]) => boolean {
  return ([start, end]) => inRange(index, start + 1, end);
}
