import { GitgraphCore } from "../gitgraph";

describe("Gitgraph.commit", () => {
  describe("initial commit", () => {
    it("should add the initial commit", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph.commit({ subject: "Initial commit" });

      const { commits } = core.getRenderedData();
      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit).toMatchObject({
        subject: "Initial commit",
        author: {
          name: "Sergio Flores",
          email: "saxo-guy@epic.com",
        },
        committer: {
          name: "Sergio Flores",
          email: "saxo-guy@epic.com",
        },
        refs: ["master", "HEAD"],
      });
    });

    it("should add the initial commit with another author", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph.commit({
        subject: "Initial commit",
        author: "Fabien BERNARD <fabien0102@gmail.com>",
      });

      const { commits } = core.getRenderedData();
      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit).toMatchObject({
        subject: "Initial commit",
        refs: ["master", "HEAD"],
        author: {
          name: "Fabien BERNARD",
          email: "fabien0102@gmail.com",
        },
        committer: {
          name: "Fabien BERNARD",
          email: "fabien0102@gmail.com",
        },
      });
    });

    it("should works with the shorter commit message syntax", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph.commit("Initial commit");

      const { commits } = core.getRenderedData();
      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit.subject).toBe("Initial commit");
    });

    it("should works without argument (default message)", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph.commit();

      const { commits } = core.getRenderedData();
      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit.subject).toBe("He doesn't like George Michael! Boooo!");
    });
  });

  describe("two commits", () => {
    let one, two;

    beforeEach(() => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      gitgraph.commit("Initial commit").commit("Second commit");

      const { commits } = core.getRenderedData();
      [one, two] = commits;
    });

    it("should set the HEAD/master refs to the last commit", () => {
      expect(one.subject).toBe("Initial commit");
      expect(one.refs).toEqual([]);

      expect(two.subject).toBe("Second commit");
      expect(two.refs).toEqual(["master", "HEAD"]);
    });

    it("should have the first commit as parent refs", () => {
      expect(two.parents).toEqual([one.hash]);
      expect(two.parentsAbbrev).toEqual([one.hashAbbrev]);
    });
  });

  it("should use given algorithm to generate commit hash", () => {
    let index = 0;
    const core = new GitgraphCore({
      generateCommitHash: () => {
        index += 1;
        return `commit${index}`;
      },
    });
    const gitgraph = core.getUserApi();

    gitgraph.commit().commit();

    const { commits } = core.getRenderedData();
    const [commit1, commit2] = commits;

    expect(commit1.hash).toBe("commit1");
    expect(commit2.hash).toBe("commit2");
  });
});
