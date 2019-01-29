import { GitgraphCore } from "../index";

describe("Gitgraph.tag", () => {
  it("should add a tag to a commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph
      .branch("master")
      .commit({ subject: "one-tagged", hash: "one-tagged-hash" });
    gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit("four");
    gitgraph.tag("this-one", "one-tagged-hash");

    expect(core.tags.getCommit("this-one")).toEqual("one-tagged-hash");
  });

  it("should add a tag to a branch", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("one");
    gitgraph
      .branch("dev")
      .commit("two")
      .commit({ subject: "three-tagged", hash: "three-tagged-hash" });
    master.commit("four");
    gitgraph.tag("this-one", "dev");

    expect(core.tags.getCommit("this-one")).toEqual("three-tagged-hash");
  });

  it("should add a tag to HEAD", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("one");
    gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit({ subject: "four-tagged", hash: "four-tagged-hash" });
    gitgraph.tag("this-one");

    expect(core.tags.getCommit("this-one")).toEqual("four-tagged-hash");
  });

  it("should add tags into render output", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("one");
    gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit("four-tagged");
    gitgraph.tag("tag-one").tag("tag-two");

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "one", tags: [] },
      { subject: "two", tags: [] },
      { subject: "three", tags: [] },
      { subject: "four-tagged", tags: ["tag-one", "tag-two"] },
    ]);
  });
});
