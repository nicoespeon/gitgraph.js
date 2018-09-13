import { GraphSymbol } from "./index";
import connectBranchCommits from "./connect-branch-commits";

const BRANCH_COLOR = "green";

const EMPTY_CELL = { value: GraphSymbol.Empty, color: "" };
const COMMIT_CELL = { value: GraphSymbol.Commit, color: "red" };
const BRANCH_CELL = { value: GraphSymbol.Branch, color: BRANCH_COLOR };

it("should not modify an empty line", () => {
  const emptyLine = [];

  const newLine = connectBranchCommits(BRANCH_COLOR, emptyLine);

  expect(newLine).toEqual(emptyLine);
});

it("should not modify a line full of empty cells", () => {
  const emptyCellsLine = [EMPTY_CELL, EMPTY_CELL];

  const newLine = connectBranchCommits(BRANCH_COLOR, emptyCellsLine);

  expect(newLine).toEqual(emptyCellsLine);
});

it("should not modify a line with only one commit cell", () => {
  const oneCommitCellLine = [COMMIT_CELL, EMPTY_CELL, EMPTY_CELL];

  const newLine = connectBranchCommits(BRANCH_COLOR, oneCommitCellLine);

  expect(newLine).toEqual(oneCommitCellLine);
});

it("should fill cells between 2 commits with branch cells", () => {
  const line = [
    EMPTY_CELL,
    COMMIT_CELL,
    EMPTY_CELL,
    EMPTY_CELL,
    COMMIT_CELL,
    EMPTY_CELL,
  ];

  const newLine = connectBranchCommits(BRANCH_COLOR, line);

  const expectedLine = [
    EMPTY_CELL,
    COMMIT_CELL,
    BRANCH_CELL,
    BRANCH_CELL,
    COMMIT_CELL,
    EMPTY_CELL,
  ];
  expect(newLine).toEqual(expectedLine);
});

it("should fill cells between all commits with branch cells", () => {
  const line = [COMMIT_CELL, EMPTY_CELL, COMMIT_CELL, EMPTY_CELL, COMMIT_CELL];

  const newLine = connectBranchCommits(BRANCH_COLOR, line);

  const expectedLine = [
    COMMIT_CELL,
    BRANCH_CELL,
    COMMIT_CELL,
    BRANCH_CELL,
    COMMIT_CELL,
  ];
  expect(newLine).toEqual(expectedLine);
});
