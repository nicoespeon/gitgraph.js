import "jest";
import { GitgraphCore, Commit} from "../index";

describe("Gitgraph.commit", () => {
  describe("initial commit", () => {
    it("should add the initial commit", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      gitgraph.commit({ subject: "Initial commit" });

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
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      gitgraph.commit({ subject: "Initial commit", author: "Fabien BERNARD <fabien0102@gmail.com>" });

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
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      gitgraph.commit("Initial commit");

      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit.subject).toBe("Initial commit");
    });

    it("should works without argument (default message)", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      gitgraph.commit();

      const [commit] = commits;

      expect(commits.length).toBe(1);
      expect(commit.subject).toBe("He doesn't like George Michael! Boooo!");
    });
  });

  describe("two commits", () => {
    let one, two;
    beforeEach(() => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      gitgraph
        .commit("Initial commit")
        .commit("Second commit");

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
});
