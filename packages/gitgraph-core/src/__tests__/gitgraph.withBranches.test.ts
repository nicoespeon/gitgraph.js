import "jest";
import {GitgraphCore, Commit} from "../index";

describe("Gitgraph.withBranches", () => {
  it("should deal one branch (no merge)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    expect(commits).toMatchObject([{
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
    }, {
      subject: "four",
      branches: ["master"],
    },
    {
      subject: "five",
      branches: ["dev"],
    }]);
  });
  it("should deal one branch (with merge)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    expect(commits).toMatchObject([{
      subject: "one",
      branches: ["master", "dev"],
    },
    {
      subject: "two",
      branches: ["master", "dev"],
    },
    {
      subject: "three",
      branches: ["master", "dev"],
    }, {
      subject: "four",
      branches: ["master"],
    },
    {
      subject: "five",
      branches: ["master", "dev"],
    },
    {
      subject: "Merge branch dev",
      branches: ["master"],
    },
    ]);
  });
});
