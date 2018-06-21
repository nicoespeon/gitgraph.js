import { GitgraphCore, Branch } from "gitgraph-core/lib/index";
import render, { IRenderGraph } from "./render";

let gitgraph: GitgraphCore;
let master: Branch;
let logger: IRenderGraph;

beforeEach(() => {
  gitgraph = new GitgraphCore();
  master = gitgraph.branch("master");
  logger = {
    commit: jest.fn()
  };
});

it("should log commit message for a single commit", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });

  render(logger, gitgraph.getRenderedData());

  expect(logger.commit).toBeCalledWith("9a58c0b", "Hello");
  expect(logger.commit).toHaveBeenCalledTimes(1);
});

it("should log commit messages for multiple commits", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });
  master.commit({
    hash: "8b4581ad6fc5ceca3726e585c2a46a76a4cd3a23",
    subject: "World!"
  });

  render(logger, gitgraph.getRenderedData());

  const commitFn = (logger.commit as jest.Mock);
  expect(commitFn.mock.calls).toEqual([
    ["9a58c0b", "Hello"],
    ["8b4581a", "World!"]
  ]);
});

it("should log a branch with one commit like it was a single line", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");

  render(logger, gitgraph.getRenderedData());

  const commitFn = (logger.commit as jest.Mock);
  expect(commitFn).toHaveBeenCalledTimes(2);
  expect(commitFn.mock.calls).toEqual([
    [expect.any(String), "one"],
    [expect.any(String), "two"]
  ]);
});
