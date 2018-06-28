import { GraphSymbol } from "./index";
import connectBranchCommits from "./connect-branch-commits";

it("should not modify an empty line", () => {
  const emptyLine = [];

  const newLine = connectBranchCommits(emptyLine);

  expect(newLine).toEqual(emptyLine);
});

it("should not modify a line full of empty symbols", () => {
  const emptySymbols = [
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Empty }
  ];

  const newLine = connectBranchCommits(emptySymbols);

  expect(newLine).toEqual(emptySymbols);
});

it("should not modify a line with only one commit symbol", () => {
  const oneCommitSymbol = [
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Empty }
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  expect(newLine).toEqual(oneCommitSymbol);
});

it("should fill cells between 2 commits with branch symbols", () => {
  const oneCommitSymbol = [
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty }
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  const expectedLine = [
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Branch },
    { value: GraphSymbol.Branch },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty }
  ];
  expect(newLine).toEqual(expectedLine);
});

it("should fill cells between all commits with branch symbols", () => {
  const oneCommitSymbol = [
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Empty },
    { value: GraphSymbol.Commit }
  ];

  const newLine = connectBranchCommits(oneCommitSymbol);

  const expectedLine = [
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Branch },
    { value: GraphSymbol.Commit },
    { value: GraphSymbol.Branch },
    { value: GraphSymbol.Commit }
  ];
  expect(newLine).toEqual(expectedLine);
});
