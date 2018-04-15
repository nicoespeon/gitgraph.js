import "jest";
import { GitgraphCore } from "../index";

describe("Gitgraph.render.branchesPaths", () => {
  it("should generate branches paths for a simple case", () => {
    let branchesPaths;
    const gitgraph = new GitgraphCore({ onRender: (c, b) => branchesPaths = b });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      { x: 0, y: 80 * 5 }, // one
      { x: 0, y: 80 * 4 }, // two
      { x: 0, y: 80 * 3 },
      { x: 0, y: 80 * 2 }, // four
      { x: 0, y: 80 * 1 },
      { x: 0, y: 0 }, // Merge commit
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      { x: 0, y: 80 * 4 }, // two - start branch
      { x: 50, y: 80 * 3 }, // three
      { x: 50, y: 80 * 2 },
      { x: 50, y: 80 * 1 }, // five
      { x: 0, y: 0 }, // Merge commit
    ]);
  });

  it("should generate branches paths if I'm waiting to commit on dev", () => {
    let branchesPaths;
    const gitgraph = new GitgraphCore({ onRender: (c, b) => branchesPaths = b });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    master.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      { x: 0, y: 80 * 5 }, // one
      { x: 0, y: 80 * 4 }, // two
      { x: 0, y: 80 * 3 }, // three
      { x: 0, y: 80 * 2 }, // four
      { x: 0, y: 80 * 1 },
      { x: 0, y: 0 }, // Merge commit
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      { x: 0, y: 80 * 4 }, // two - start branch
      { x: 50, y: 80 * 3 },
      { x: 50, y: 80 * 2 },
      { x: 50, y: 80 * 1 }, // five
      { x: 0, y: 0 }, // Merge commit
    ]);
  });

  it("should deal with the second commit", () => {
    let branchesPaths;
    const gitgraph = new GitgraphCore({ onRender: (c, b) => branchesPaths = b });

    gitgraph.branch("master").commit("Initial commit");
    gitgraph.branch("dev").commit().commit();

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      { x: 0, y: 80 * 2 },
    ]);
    expect(result[1][0].name).toBe("dev");
    expect(result[1][1]).toEqual([
      { x: 0, y: 80 * 2 },
      { x: 50, y: 80 * 1 },
      { x: 50, y: 80 * 0 },
    ]);
  });

  it("should stop on last commit", () => {
    let branchesPaths;
    const gitgraph = new GitgraphCore({ onRender: (c, b) => branchesPaths = b });

    const master = gitgraph.branch("master").commit("Initial commit");
    const develop = gitgraph.branch("dev");
    const feat = gitgraph.branch("feat");
    feat.commit();
    master.commit("five");
    develop.commit("six");
    master.merge(develop);

    // We can't use `toMatchObject` here due to circular ref inside Branch.
    const result = Array.from(branchesPaths);
    expect(result[0][0].name).toBe("master");
    expect(result[0][1]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 0, y: 80 * 3 },
      { x: 0, y: 80 * 2 },
      { x: 0, y: 80 * 1 },
      { x: 0, y: 80 * 0 },
    ]);
    expect(result[1][0].name).toBe("feat");
    expect(result[1][1]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 50, y: 80 * 3 },
    ]);
    expect(result[2][0].name).toBe("dev");
    expect(result[2][1]).toEqual([
      { x: 0, y: 80 * 4 },
      { x: 100, y: 80 * 3 },
      { x: 100, y: 80 * 2 },
      { x: 100, y: 80 * 1 },
      { x: 0, y: 80 * 0 },
    ]);
  });
});
