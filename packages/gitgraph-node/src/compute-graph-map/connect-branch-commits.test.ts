import { GraphSymbol } from "./index";
import connectBranchCommits from "./connect-branch-commits";

it("should not modify an empty line", () => {
  const emptyLine = [];

  const newLine = connectBranchCommits(emptyLine);

  expect(newLine).toEqual(emptyLine);
});

it("should not modify a line full of empty symbols", () => {
  const emptySymbols = [GraphSymbol.Empty, GraphSymbol.Empty];

  const newLine = connectBranchCommits(emptySymbols);

  expect(newLine).toEqual(emptySymbols);
});

it("should not modify a line with only one commit symbol", () => {
  const oneCommitSymbol = [
    GraphSymbol.Commit,
    GraphSymbol.Empty,
    GraphSymbol.Empty
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  expect(newLine).toEqual(oneCommitSymbol);
});

it("should fill cells between 2 commits with branch symbols", () => {
  const oneCommitSymbol = [
    GraphSymbol.Empty,
    GraphSymbol.Commit,
    GraphSymbol.Empty,
    GraphSymbol.Empty,
    GraphSymbol.Commit,
    GraphSymbol.Empty
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  const expectedLine = [
    GraphSymbol.Empty,
    GraphSymbol.Commit,
    GraphSymbol.Branch,
    GraphSymbol.Branch,
    GraphSymbol.Commit,
    GraphSymbol.Empty
  ];
  expect(newLine).toEqual(expectedLine);
});

it("should fill cells between all commits with branch symbols", () => {
  const oneCommitSymbol = [
    GraphSymbol.Commit,
    GraphSymbol.Empty,
    GraphSymbol.Commit,
    GraphSymbol.Empty,
    GraphSymbol.Commit
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  const expectedLine = [
    GraphSymbol.Commit,
    GraphSymbol.Branch,
    GraphSymbol.Commit,
    GraphSymbol.Branch,
    GraphSymbol.Commit
  ];
  expect(newLine).toEqual(expectedLine);
});
