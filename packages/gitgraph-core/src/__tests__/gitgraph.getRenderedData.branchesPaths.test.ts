import "jest";
import { GitgraphCore, metroTemplate, TemplateEnum, OrientationsEnum } from "../index";

describe("Gitgraph.render.branchesPaths", () => {
  let gitgraph: GitgraphCore;

  beforeEach(() => {
    gitgraph = new GitgraphCore();
  });

  it("should generate branches paths for a simple case", () => {
    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { branchesPaths } = gitgraph.getRenderedData();

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
    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    master.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { branchesPaths } = gitgraph.getRenderedData();

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
    gitgraph.branch("master").commit("Initial commit");
    gitgraph
      .branch("dev")
      .commit()
      .commit();

    const { branchesPaths } = gitgraph.getRenderedData();

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
    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = gitgraph.getRenderedData();

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
    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.merge(master);
    master.commit();

    const { branchesPaths } = gitgraph.getRenderedData();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      [
        { x: 0, y: 320 },
        { x: 0, y: 240 },
        { x: 0, y: 160 }, // commit before merge
        { x: 50, y: 80 }, // merge commit
      ],
      [{ x: 0, y: 160 }, { x: 0, y: 80 }, { x: 0, y: 0 }],
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      [
        { x: 0, y: 320 },
        { x: 50, y: 240 },
        { x: 50, y: 160 },
        { x: 50, y: 80 }, // merge commit
      ],
    ]);
  });

  it("should deal with horizontal orientation", () => {
    gitgraph = new GitgraphCore({orientation: OrientationsEnum.Horizontal});
    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.commit();
    master.merge(dev);

    const { branchesPaths } = gitgraph.getRenderedData();

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
      ]
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
    gitgraph = new GitgraphCore({orientation: OrientationsEnum.HorizontalReverse});
    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.commit();
    master.merge(dev);

    const { branchesPaths } = gitgraph.getRenderedData();

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
      ]
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
    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = gitgraph.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[0][0].computedColor).toBe(metroTemplate.colors[0]);
    expect(result[1][0].computedColor).toBe(metroTemplate.colors[1]);
    expect(result[2][0].computedColor).toBe(metroTemplate.colors[2]);
  });

  it("should have the correct computed color for each branch with a specific color", () => {
    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch({name: "feat", style: {color: "red"}});
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = gitgraph.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][0].computedColor).toBe("red");
  });

  it("should have the correct computed color for each branch with a specific color", () => {
    const gitgraphWithSingleColorTemplate = new GitgraphCore({template: TemplateEnum.BlackArrow});
    const master = gitgraphWithSingleColorTemplate.branch("master").commit("Initial commit");
    const develop = gitgraphWithSingleColorTemplate.branch("dev");
    const feat = gitgraphWithSingleColorTemplate.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    const { branchesPaths } = gitgraphWithSingleColorTemplate.getRenderedData();

    const result = Array.from(branchesPaths);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][0].computedColor).toBe("#000000");
  });
});
