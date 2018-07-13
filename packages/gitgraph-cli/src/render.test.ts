import { GitgraphCore, Branch } from "gitgraph-core/lib/index";
import render, { IRenderGraph } from "./render";

let gitgraph: GitgraphCore;
let master: Branch;
let logger: IRenderGraph;

beforeEach(() => {
  gitgraph = new GitgraphCore();
  master = gitgraph.branch("master");
  logger = {
    commit: jest.fn(),
    openBranch: jest.fn()
  };
});

it("should log commit message for a single commit on a single branch", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });

  render(logger, gitgraph);

  expect(logger.commit).toBeCalledWith("9a58c0b", ["master", "HEAD"], "Hello", false, 0);
  expect(logger.commit).toHaveBeenCalledTimes(1);
});

it("should log commit messages for multiple commits on a single branch", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });
  master.commit({
    hash: "8b4581ad6fc5ceca3726e585c2a46a76a4cd3a23",
    subject: "World!"
  });

  render(logger, gitgraph);

  const commitFn = (logger.commit as jest.Mock);
  expect(commitFn.mock.calls).toEqual([
    ["9a58c0b", [], "Hello", false, 0],
    ["8b4581a", ["master", "HEAD"], "World!", false, 0]
  ]);
});

it("should log commit messages for multiple commits that could be fast-forwarded on 2 branches", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");

  render(logger, gitgraph);

  const commitFn = (logger.commit as jest.Mock);
  expect(commitFn.mock.calls).toEqual([
    [expect.any(String), ["master"], "one", false, 1],
    [expect.any(String), ["develop", "HEAD"], "two", true, 0]
  ]);
});

it("should log commit messages for multiple commits on 2 branches", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");
  master.commit("three");
  develop.commit("four");

  render(logger, gitgraph);

  const commitFn = (logger.commit as jest.Mock);
  expect(commitFn.mock.calls).toEqual([
    [expect.any(String), [], "one", false, 1],
    [expect.any(String), [], "two", true, 0],
    [expect.any(String), ["master"], "three", false, 1],
    [expect.any(String), ["develop", "HEAD"], "four", true, 0]
  ]);

  expect(logger.openBranch).toHaveBeenCalledTimes(1);
});
