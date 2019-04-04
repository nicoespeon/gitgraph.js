import { GitgraphCore } from "../gitgraph";
import { Orientation } from "../orientation";
import { CompareBranchesOrder } from "../branches-order";
import { metroTemplate, TemplateName } from "../template";

describe("Gitgraph.getRenderedData.branchesPaths", () => {
  it("should generate branches paths for a simple case", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1][0]).toEqual([
      { x: 0, y: 80 * 5 }, // one
      { x: 0, y: 80 * 4 }, // two
      { x: 0, y: 80 * 3 },
      { x: 0, y: 80 * 2 }, // four
      { x: 0, y: 80 * 1 },
      { x: 0, y: 0 }, // Merge commit
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1][0]).toEqual([
      { x: 0, y: 80 * 4 }, // two - start branch
      { x: 50, y: 80 * 3 }, // three
      { x: 50, y: 80 * 2 },
      { x: 50, y: 80 * 1 }, // five
      { x: 0, y: 0 }, // Merge commit
    ]);
  });

  it("should generate branches paths if I'm waiting to commit on dev", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    master.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1][0]).toEqual([
      { x: 0, y: 80 * 5 }, // one
      { x: 0, y: 80 * 4 }, // two
      { x: 0, y: 80 * 3 }, // three
      { x: 0, y: 80 * 2 }, // four
      { x: 0, y: 80 * 1 },
      { x: 0, y: 0 }, // Merge commit
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1][0]).toEqual([
      { x: 0, y: 80 * 4 }, // two - start branch
      { x: 50, y: 80 * 3 },
      { x: 50, y: 80 * 2 },
      { x: 50, y: 80 * 1 }, // five
      { x: 0, y: 0 }, // Merge commit
    ]);
  });

  it("should deal with the second commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit("Initial commit");
    gitgraph
      .branch("dev")
      .commit()
      .commit();

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1][0]).toEqual([{ x: 0, y: 80 * 2 }]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1][0]).toEqual([
      { x: 0, y: 80 * 2 },
      { x: 50, y: 80 * 1 },
      { x: 50, y: 80 * 0 },
    ]);
  });

  it("should stop on last commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1][0]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 0, y: 80 * 3 },
      { x: 0, y: 80 * 2 },
      { x: 0, y: 80 * 1 },
      { x: 0, y: 80 * 0 },
    ]);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][1][0]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 50, y: 80 * 3 },
    ]);
    expect(result[2][0].name).toBe("dev");
    expect(result[2][1][0]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 100, y: 80 * 3 },
      { x: 100, y: 80 * 2 },
      { x: 100, y: 80 * 1 },
      { x: 0, y: 80 * 0 },
    ]);
  });

  it("should deal with a commit after a merge", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    master.merge(dev);
    master.commit();

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 80 * 4 },
        { x: 0, y: 80 * 3 },
        { x: 0, y: 80 * 2 }, // commit before merge
        { x: 0, y: 80 * 1 }, // merge commit
        { x: 0, y: 80 * 0 },
      ],
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 80 * 4 },
        { x: 50, y: 80 * 3 },
        { x: 50, y: 80 * 2 },
        { x: 0, y: 80 * 1 }, // merge commit
      ],
    ]);
  });

  it("should deal with a commit after a merge (vertical reverse)", () => {
    const core = new GitgraphCore({ orientation: Orientation.VerticalReverse });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    master.merge(dev);
    dev.commit();

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 80 * 3 },
        { x: 0, y: 80 * 2 },
        { x: 0, y: 80 * 1 },
        { x: 0, y: 80 * 0 },
      ],
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 80 * 3 }, // Merge commit on master
        { x: 50, y: 80 * 2 },
        { x: 50, y: 80 * 1 },
        { x: 0, y: 80 * 0 },
      ],
      [
        { x: 50, y: 80 * 4 }, // Last commit on dev
        { x: 50, y: 80 * 3 },
        { x: 50, y: 80 * 2 },
        { x: 50, y: 80 * 1 },
      ],
    ]);
  });

  it("should deal with 3 branches (with multiple merges in master)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit().commit();

    const develop = gitgraph.branch("develop");
    develop.commit();
    master.merge(develop);

    const feat1 = gitgraph.branch("feat1");
    feat1.commit();
    master.commit();
    master.merge(feat1);

    const feat2 = gitgraph.branch("feat2");
    feat2.commit();
    master.commit().commit();
    master.merge(feat2);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 80 * 10 },
        { x: 0, y: 80 * 9 },
        { x: 0, y: 80 * 8 },
        { x: 0, y: 80 * 7 }, // merge develop
        { x: 0, y: 80 * 6 },
        { x: 0, y: 80 * 5 },
        { x: 0, y: 80 * 4 }, // merge feat1
        { x: 0, y: 80 * 3 },
        { x: 0, y: 80 * 2 },
        { x: 0, y: 80 * 1 },
        { x: 0, y: 80 * 0 }, // merge feat2
      ],
    ]);
    expect(result[1][0].name).toBe("develop");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 80 * 9 },
        { x: 50, y: 80 * 8 },
        { x: 0, y: 80 * 7 }, // merge develop
      ],
    ]);
    expect(result[2][0].name).toBe("feat1");
    expect(result[2][1]).toEqual([
      [
        { x: 0, y: 80 * 7 }, // merge develop
        { x: 100, y: 80 * 6 },
        { x: 100, y: 80 * 5 },
        { x: 0, y: 80 * 4 }, // merge feat1
      ],
    ]);
    expect(result[3][0].name).toBe("feat2");
    expect(result[3][1]).toEqual([
      [
        { x: 0, y: 80 * 4 }, // merge feat1
        { x: 150, y: 80 * 3 },
        { x: 150, y: 80 * 2 },
        { x: 150, y: 80 * 1 },
        { x: 0, y: 80 * 0 }, // merge feat2
      ],
    ]);
  });

  it("should deal with 3 branches (with multiple merges)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit().commit();

    const develop = gitgraph.branch("develop");
    develop.commit();

    const feat1 = gitgraph.branch("feat1");
    feat1.commit().commit();

    develop.commit();
    develop.merge(feat1);

    master.commit().commit();
    master.merge(develop);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 80 * 9 },
        { x: 0, y: 80 * 8 },
        { x: 0, y: 80 * 7 }, // merge develop
        { x: 0, y: 80 * 6 },
        { x: 0, y: 80 * 5 },
        { x: 0, y: 80 * 4 }, // merge feat1
        { x: 0, y: 80 * 3 },
        { x: 0, y: 80 * 2 },
        { x: 0, y: 80 * 1 },
        { x: 0, y: 80 * 0 }, // merge feat2
      ],
    ]);
    expect(result[1][0].name).toBe("develop");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 80 * 8 },
        { x: 50, y: 80 * 7 },
        { x: 50, y: 80 * 6 },
        { x: 50, y: 80 * 5 },
        { x: 50, y: 80 * 4 },
        { x: 50, y: 80 * 3 },
        { x: 50, y: 80 * 2 },
        { x: 50, y: 80 * 1 },
        { x: 0, y: 80 * 0 }, // merge develop
      ],
    ]);
    expect(result[2][0].name).toBe("feat1");
    expect(result[2][1]).toEqual([
      [
        { x: 50, y: 80 * 7 },
        { x: 100, y: 80 * 6 },
        { x: 100, y: 80 * 5 },
        { x: 100, y: 80 * 4 },
        { x: 50, y: 80 * 3 }, // merge feat1
      ],
    ]);
  });

  it("should deal with horizontal orientation", () => {
    const core = new GitgraphCore({ orientation: Orientation.Horizontal });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.commit();
    master.merge(dev);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 0 },
        { x: 80, y: 0 },
        { x: 160, y: 0 },
        { x: 240, y: 0 },
        { x: 320, y: 0 }, // merge commit
      ],
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 0 },
        { x: 80, y: 50 },
        { x: 160, y: 50 },
        { x: 240, y: 50 },
        { x: 320, y: 0 }, // merge commit
      ],
    ]);
  });

  it("should deal with horizontal-reverse orientation", () => {
    const core = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.commit();
    master.merge(dev);

    const { branchesPaths } = core.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 0 },
        { x: 80, y: 0 },
        { x: 160, y: 0 },
        { x: 240, y: 0 },
        { x: 320, y: 0 }, // merge commit
      ],
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 0 },
        { x: 80, y: 50 },
        { x: 160, y: 50 },
        { x: 240, y: 50 },
        { x: 320, y: 0 }, // merge commit
      ],
    ]);
  });

  it("should have the correct computed color for each branch", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit();
    gitgraph.branch("dev").commit();
    gitgraph.branch("feat1").commit();
    gitgraph.branch("feat2").commit();
    gitgraph.branch("feat3").commit();

    const { branchesPaths } = core.getRenderedData();

    const branches = Array.from(branchesPaths.keys());
    expect(branches[0].computedColor).toBe(metroTemplate.colors[0]);
    expect(branches[1].computedColor).toBe(metroTemplate.colors[1]);
    expect(branches[2].computedColor).toBe(metroTemplate.colors[2]);
    expect(branches[3].computedColor).toBe(metroTemplate.colors[0]);
    expect(branches[4].computedColor).toBe(metroTemplate.colors[1]);
  });

  it("should have the correct computed color for branch with a specific color set", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch({ name: "feat", style: { color: "red" } });
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = core.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][0].computedColor).toBe("red");
  });

  it("should have the correct computed color for BlackArrow template", () => {
    const core = new GitgraphCore({
      template: TemplateName.BlackArrow,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = core.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][0].computedColor).toBe("#000000");
  });

  it("should generate branches paths if I define branches order function", () => {
    const desiredBranchesOrder = ["dev", "master"];

    const compareBranchesOrder: CompareBranchesOrder = (
      branchNameA,
      branchNameB,
    ) =>
      desiredBranchesOrder.indexOf(branchNameA) -
      desiredBranchesOrder.indexOf(branchNameB);

    const core = new GitgraphCore({ compareBranchesOrder });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { branchesPaths } = core.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][0].computedColor).toBe(metroTemplate.colors[1]);
    expect(result[0][1][0]).toEqual([
      { x: 50, y: 80 * 5 }, // one
      { x: 50, y: 80 * 4 }, // two
      { x: 50, y: 80 * 3 },
      { x: 50, y: 80 * 2 }, // four
      { x: 50, y: 80 * 1 },
      { x: 50, y: 0 }, // Merge commit
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][0].computedColor).toBe(metroTemplate.colors[0]);
    expect(result[1][1][0]).toEqual([
      { x: 50, y: 80 * 4 }, // two - start branch
      { x: 0, y: 80 * 3 }, // three
      { x: 0, y: 80 * 2 },
      { x: 0, y: 80 * 1 }, // five
      { x: 50, y: 0 }, // Merge commit
    ]);
  });
});
