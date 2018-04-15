import "jest";
import { GitgraphCore, Commit, GitgraphOptions } from "../index";

describe("Gitgraph.render", () => {
  let gitgraph: GitgraphCore;

  beforeEach(() => {
    gitgraph = new GitgraphCore({ onRender: jest.fn() });
  });

  it("should call render method on render", () => {
    gitgraph.render();
    expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(1);
  });

  it("should call render on each commit", () => {
    gitgraph.commit().commit().commit();

    expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(3);
  });

  it("should call render on merge", () => {
    const master = gitgraph.branch("master").commit().commit().commit();
    const dev = gitgraph.branch("dev").commit().commit();
    master.merge(dev);

    expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(6);
  });
});
