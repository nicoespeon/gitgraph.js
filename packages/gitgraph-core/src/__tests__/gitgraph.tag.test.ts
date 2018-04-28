import "jest";
import { GitgraphCore, Commit } from "../index";

describe("Gitgraph.tag", () => {
  it("should add a tag to a commit", () => {
    const gitgraph = new GitgraphCore();
    const master = gitgraph
      .branch("master")
      .commit({ subject: "one-tagged", hash: "one-tagged-hash" });
    const dev = gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit("four");
    gitgraph.tag("this-one", "one-tagged-hash");

    expect(gitgraph.tags.get("this-one")).toEqual("one-tagged-hash");
  });

  it("should add a tag to a branch", () => {
    const gitgraph = new GitgraphCore();
    const master = gitgraph.branch("master").commit("one");
    const dev = gitgraph
      .branch("dev")
      .commit("two")
      .commit({ subject: "three-tagged", hash: "three-tagged-hash" });
    master.commit("four");
    gitgraph.tag("this-one", "dev");

    expect(gitgraph.tags.get("this-one")).toEqual("three-tagged-hash");
  });

  it("should add a tag to HEAD", () => {
    const gitgraph = new GitgraphCore();
    const master = gitgraph.branch("master").commit("one");
    const dev = gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit({ subject: "four-tagged", hash: "four-tagged-hash" });
    gitgraph.tag("this-one");

    expect(gitgraph.tags.get("this-one")).toEqual("four-tagged-hash");
  });

  it("should add tags into render output", () => {
    const gitgraph = new GitgraphCore();
    const master = gitgraph.branch("master").commit("one");
    const dev = gitgraph
      .branch("dev")
      .commit("two")
      .commit("three");
    master.commit("four-tagged");
    gitgraph.tag("tag-one").tag("tag-two");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "one", tags: [] },
      { subject: "two", tags: [] },
      { subject: "three", tags: [] },
      { subject: "four-tagged", tags: ["tag-one", "tag-two"] },
    ]);
  });
});
