import { GitgraphCore } from "../gitgraph";

describe("Gitgraph.clear", () => {
  it("should clear everything", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    gitgraph.clear();

    const { commits } = core.getRenderedData();

    expect(commits).toEqual([]);
    expect(core.refs.getAllNames()).toEqual([]);
    expect(core.tags.getAllNames()).toEqual([]);
  });

  it("should reset the currentBranch", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch("dev").checkout();
    expect(core.currentBranch.name).toBe("dev");

    gitgraph.clear();

    expect(core.currentBranch.name).toBe("master");
  });

  it("should be able to add normally a commit after a clear", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .branch("dev")
      .commit("one")
      .commit("two");
    gitgraph.clear();
    gitgraph
      .branch("feat")
      .commit("three")
      .commit("four");

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "three", branches: ["feat"] },
      { subject: "four", branches: ["feat"] },
    ]);
  });
});
