import "jest";
import {GitgraphCore, Commit} from "../index";

describe("Gitgraph.clear", () => {
  it("should clear everything", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    gitgraph.clear();

    expect(commits).toEqual([]);
    expect(Array.from(gitgraph.refs.values())).toEqual([]);
    expect(Array.from(gitgraph.tags.values())).toEqual([]);
  });

  it("should reset the currentBranch", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
    const dev = gitgraph.branch("dev").checkout();
    expect(gitgraph.currentBranch.name).toBe("dev");

    gitgraph.clear();
    expect(gitgraph.currentBranch.name).toBe("master");
  });

  it("should be able to add normally a commit after a clear", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
    gitgraph.branch("dev").commit("one").commit("two");
    gitgraph.clear();
    gitgraph.branch("feat").commit("three").commit("four");

    expect(commits).toMatchObject([
      { subject: "three", branches: ["feat"] },
      { subject: "four", branches: ["feat"] },
    ]);
  });
});
