import { GitgraphCore } from "../gitgraph";

describe("Gitgraph.getRenderedData.tags", () => {
  it("should tag a commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .commit("one")
      .commit({ subject: "with tag", tag: "1.0.0" })
      .commit("three");

    const { commits } = core.getRenderedData();

    expect(commits[1].tags.length).toBe(1);
    expect(commits[1].tags[0].name).toBe("1.0.0");
  });

  it("should tag the last commit of the branch", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    const dev = gitgraph
      .branch("dev")
      .commit("one")
      .commit({ subject: "two-tagged", hash: "two-tagged-hash" })
      .tag("this-one");

    master.commit("three");
    dev.commit("four");

    expect(core.tags.getCommit("this-one")).toEqual("two-tagged-hash");
  });
});
