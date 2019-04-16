import { GitgraphCore } from "../gitgraph";

describe("Gitgraph.getRenderedData.branches", () => {
  it("should deal with one branch (no merge)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        branches: ["master", "dev"],
      },
      {
        subject: "two",
        branches: ["master", "dev"],
      },
      {
        subject: "three",
        branches: ["dev"],
      },
      {
        subject: "four",
        branches: ["master"],
      },
      {
        subject: "five",
        branches: ["dev"],
      },
    ]);
  });

  it("should deal with one branch (with merge)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        branches: ["master", "dev"],
      },
      {
        subject: "two",
        branches: ["master", "dev"],
      },
      {
        subject: "three",
        branches: ["dev"],
      },
      {
        subject: "four",
        branches: ["master"],
      },
      {
        subject: "five",
        branches: ["dev"],
      },
      {
        subject: "Merge branch dev",
        branches: ["master"],
      },
    ]);
  });

  it("should create branch from another one", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one");

    const feat1 = gitgraph.branch("feat1");
    feat1.commit("two");

    const feat2 = gitgraph.branch({ name: "feat2", from: master });
    feat2.commit("three");

    const feat1Part1 = feat1.branch("feat1/part1");
    feat1Part1.commit("four");

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        branches: ["master", "feat1", "feat2", "feat1/part1"],
      },
      {
        subject: "two",
        branches: ["feat1", "feat1/part1"],
      },
      {
        subject: "three",
        branches: ["feat2"],
      },
      {
        subject: "four",
        branches: ["feat1/part1"],
      },
    ]);
  });

  it("should calculate branch to display", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three").commit("four");

    master.merge(dev);

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        branchToDisplay: "master",
      },
      {
        subject: "two",
        branchToDisplay: "master",
      },
      {
        subject: "three",
        branchToDisplay: "dev",
      },
      {
        subject: "four",
        branchToDisplay: "dev",
      },
      {
        subject: "Merge branch dev",
        branchToDisplay: "master",
      },
    ]);
  });

  describe("commits on HEAD", () => {
    let two, three;

    beforeEach(() => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph
        .commit()
        .commit()
        .branch("develop")
        .commit();

      const { commits } = core.getRenderedData();
      [, two, three] = commits;
    });

    it("should keep master tag on the second commit", () => {
      expect(two.refs).toEqual(["master"]);
    });

    it("should have develop and head tags on the last commit", () => {
      expect(three.refs).toEqual(["develop", "HEAD"]);
    });

    it("should have the correct parents set", () => {
      expect(three.parents).toEqual([two.hash]);
    });
  });

  describe("commits on branches", () => {
    it("should have master on commit two", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("develop");
      dev.commit("three");

      const { commits } = core.getRenderedData();

      expect(commits).toMatchObject([
        { subject: "one", refs: [] },
        { subject: "two", refs: ["master"] },
        { subject: "three", refs: ["develop", "HEAD"] },
      ]);
    });

    it("should have master and HEAD on commit four", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("develop");
      dev.commit("three");
      master.commit("four");

      const { commits } = core.getRenderedData();

      expect(commits).toMatchObject([
        { subject: "one", refs: [] },
        { subject: "two", refs: [] },
        { subject: "three", refs: ["develop"] },
        { subject: "four", refs: ["master", "HEAD"] },
      ]);
    });
  });
});
