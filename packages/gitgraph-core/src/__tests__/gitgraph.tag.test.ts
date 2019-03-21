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

  it("should add a tag to a commit with style", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();
    const tagStyle = {
      color: "black",
      strokeColor: "#ce9b00",
      bgColor: "#ffce52",
      font: "italic 12pt serif",
      borderRadius: 0,
      pointerWidth: 6,
    };

    gitgraph.branch("dev").commit({ subject: "tagged", hash: "tagged-hash" });
    gitgraph.tag({ name: "this-one", ref: "tagged-hash", style: tagStyle });
    const { commits } = core.getRenderedData();

    expect(commits[0].tags[0].style).toEqual(tagStyle);
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

  it("should add a tag to a branch with options param", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch("dev").commit({ subject: "tagged", hash: "tagged-hash" });
    gitgraph.tag({ name: "this-one", ref: "dev" });

    expect(core.tags.getCommit("this-one")).toEqual("tagged-hash");
  });

  it("should tag a branch directly", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const dev = gitgraph.branch("dev");
    dev.commit({ subject: "tagged", hash: "tagged-hash" });
    dev.tag("this-one");

    expect(core.tags.getCommit("this-one")).toEqual("tagged-hash");
  });

  it("should tag a branch directly with options param", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const dev = gitgraph.branch("dev");
    dev.commit({ subject: "tagged", hash: "tagged-hash" });
    dev.tag({ name: "this-one" });

    expect(core.tags.getCommit("this-one")).toEqual("tagged-hash");
  });

  it("should add a tag to a branch with style", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();
    const tagStyle = {
      color: "black",
      strokeColor: "#ce9b00",
      bgColor: "#ffce52",
      font: "italic 12pt serif",
      borderRadius: 0,
      pointerWidth: 6,
    };

    gitgraph
      .branch("dev")
      .commit({ subject: "tagged", hash: "tagged-hash" })
      .tag({ name: "this-one", style: tagStyle });
    const { commits } = core.getRenderedData();

    expect(commits[0].tags[0].style).toEqual(tagStyle);
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

  it("should throw if given reference doesn't exist", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .branch("master")
      .commit({ subject: "tagged", hash: "tagged-hash" });

    expect(() => gitgraph.tag("this-one", "unknown")).toThrowError(
      'The ref "unknown" does not exist',
    );
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
