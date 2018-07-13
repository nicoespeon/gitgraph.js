import { GitgraphCore } from "gitgraph-core/lib/index";
import render from "./render";

it("should log commit message for a single commit", () => {
  const logger = {
    commit: jest.fn()
  };
  const gitgraph = new GitgraphCore();
  gitgraph.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });

  render(logger, gitgraph.getRenderedData());

  expect(logger.commit).toBeCalledWith("9a58c0b", "Hello");
  expect(logger.commit).toHaveBeenCalledTimes(1);
});

it("should log commit messages for multiple commits", () => {
  const logger = {
    commit: jest.fn()
  };
  const gitgraph = new GitgraphCore();
  gitgraph.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });
  gitgraph.commit({
    hash: "8b4581ad6fc5ceca3726e585c2a46a76a4cd3a23",
    subject: "World!"
  });

  render(logger, gitgraph.getRenderedData());

  expect(logger.commit.mock.calls).toEqual([
    ["9a58c0b", "Hello"],
    ["8b4581a", "World!"]
  ]);
});
