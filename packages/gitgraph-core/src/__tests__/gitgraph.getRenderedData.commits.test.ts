import { GitgraphCore } from "../index";

describe("Gitgraph.getRenderedData.commits", () => {
  it("should use a default message on merge", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one");

    const develop = gitgraph.branch("develop");
    develop.commit("two");
    master.merge(develop);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "one" },
      { subject: "two" },
      { subject: "Merge branch develop" },
    ]);
  });

  it("should accept a custom message on merge", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one");

    const develop = gitgraph.branch("develop");
    develop.commit("two");
    master.merge(develop, "Release a new feature");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      { subject: "one" },
      { subject: "two" },
      { subject: "Release a new feature" },
    ]);
  });
});
