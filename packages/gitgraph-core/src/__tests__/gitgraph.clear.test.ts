import { GitgraphCore } from "../index";

describe("Gitgraph.clear", () => {
  it("should clear everything", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    gitgraph.clear();

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toEqual([]);
    expect(gitgraph.refs.getAllNames()).toEqual([]);
    expect(gitgraph.tags.getAllNames()).toEqual([]);
  });

  it("should reset the currentBranch", () => {
    const gitgraph = new GitgraphCore();
    const dev = gitgraph.branch("dev").checkout();
    expect(gitgraph.currentBranch.name).toBe("dev");

    gitgraph.clear();
    expect(gitgraph.currentBranch.name).toBe("master");
  });

  it("should be able to add normally a commit after a clear", () => {
    const gitgraph = new GitgraphCore();
    gitgraph
      .branch("dev")
      .commit("one")
      .commit("two");
    gitgraph.clear();
    gitgraph
      .branch("feat")
      .commit("three")
      .commit("four");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "three", branches: ["feat"] },
      { subject: "four", branches: ["feat"] },
    ]);
  });
});
