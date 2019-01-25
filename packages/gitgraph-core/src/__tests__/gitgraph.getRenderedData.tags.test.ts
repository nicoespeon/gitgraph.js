import { GitgraphCore } from "../index";

describe("Gitgraph.getRenderedData.tags", () => {
  it("should tag a commit", () => {
    const gitgraph = new GitgraphCore();
    gitgraph
      .commit("one")
      .commit({ subject: "with tag", tag: "1.0.0" })
      .commit("three");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "one" },
      { subject: "with tag", tags: ["1.0.0"] },
      { subject: "three" },
    ]);
  });

  it("should tag the last commit of the branch", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    const dev = gitgraph
      .branch("dev")
      .commit("one")
      .commit({ subject: "two-tagged", hash: "two-tagged-hash" })
      .tag("this-one");

    master.commit("three");
    dev.commit("four");

    expect(gitgraph.tags.getCommit("this-one")).toEqual("two-tagged-hash");
  });
});
