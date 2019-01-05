import { GitgraphCore } from "../index";

describe("Gitgraph.getRenderedData.branches", () => {
  it("should deal with one branch (no merge)", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const { commits } = gitgraph.getRenderedData();

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
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

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

  it("should calculate branch to display", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three").commit("four");

    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

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
});
