import { GitgraphCore } from "../gitgraph";

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

    expect(commits[0].tags.length).toBe(0);
    expect(commits[1].tags.length).toBe(0);
    expect(commits[2].tags.length).toBe(0);
    expect(commits[3].tags.length).toBe(2);
    expect(commits[3].tags[0].name).toBe("tag-one");
    expect(commits[3].tags[1].name).toBe("tag-two");
  });
});
