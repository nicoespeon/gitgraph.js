import "jest";
import { GitgraphCore, TemplateEnum, OrientationsEnum, ModeEnum, GitgraphOptions } from "../gitgraph";
import Commit from "../commit";
import { metroTemplate } from "../template";
import { readFileSync } from "fs";
import { join } from "path";
import { debug } from "../utils";

describe("Gitgraph", () => {
  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph = new GitgraphCore({ onRender: () => null });

      expect(gitgraph).toMatchObject({
        author: "Sergio Flores <saxo-guy@epic.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: false,
      });
    });

    it("should be able to override options", () => {
      const gitgraph = new GitgraphCore({
        onRender: () => null,
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        reverseArrow: true,
        template: TemplateEnum.Metro,
      });

      expect(gitgraph).toMatchObject({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: true,
        template: metroTemplate,
      });
    });
  });

  describe("commit", () => {
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

  describe("clear", () => {
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

  describe("withBranches", () => {
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

  describe("withPosition", () => {
    it("should deal with 3 straight commits", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      gitgraph.commit("one").commit("two").commit("three");

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0,
        y: 160,
      }, {
        subject: "two",
        x: 0,
        y: 80,
      }, {
        subject: "three",
        x: 0,
        y: 0,
      }]);
    });

    it("should deal with 3 straight commits (reverse)", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({
        onRender: (c) => commits = c,
        orientation: OrientationsEnum.VerticalReverse,
      });
      gitgraph.commit("one").commit("two").commit("three");

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0,
        y: 0,
      }, {
        subject: "two",
        x: 0,
        y: 80,
      }, {
        subject: "three",
        x: 0,
        y: 160,
      }]);
    });

    it("should deal with 3 straight commits (horizontal)", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({
        onRender: (c) => commits = c,
        orientation: OrientationsEnum.Horizontal,
      });
      gitgraph.commit("one").commit("two").commit("three");

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0,
        y: 0,
      }, {
        subject: "two",
        x: 80,
        y: 0,
      }, {
        subject: "three",
        x: 160,
        y: 0,
      }]);
    });

    it("should deal with 3 straight commits (horizontal-reverse)", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({
        onRender: (c) => commits = c,
        orientation: OrientationsEnum.HorizontalReverse,
      });
      gitgraph.commit("one").commit("two").commit("three");

      expect(commits).toMatchObject([{
        subject: "one",
        x: 160,
        y: 0,
      }, {
        subject: "two",
        x: 80,
        y: 0,
      }, {
        subject: "three",
        x: 0,
        y: 0,
      }]);
    });

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
        x: 0,
        y: 80 * 4,
      }, {
        subject: "two",
        x: 0,
        y: 80 * 3,
      }, {
        subject: "three",
        x: 50, // dev
        y: 80 * 2,
      }, {
        subject: "four",
        x: 0,
        y: 80,
      }, {
        subject: "five",
        x: 50, // dev
        y: 0,
      }]);
    });

    it("should deal two branches (no merge)", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");
      const feat = gitgraph.branch("feat");
      feat.commit("six");

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0,
        y: 80 * 5,
      }, {
        subject: "two",
        x: 0,
        y: 80 * 4,
      }, {
        subject: "three",
        x: 50, // dev
        y: 80 * 3,
      }, {
        subject: "four",
        x: 0,
        y: 80 * 2,
      }, {
        subject: "five",
        x: 50, // dev
        y: 80 * 1,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 0,
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
        x: 0,
        y: 80 * 5,
      }, {
        subject: "two",
        x: 0,
        y: 80 * 4,
      }, {
        subject: "three",
        x: 50, // dev
        y: 80 * 3,
      }, {
        subject: "four",
        x: 0,
        y: 80 * 2,
      }, {
        subject: "five",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0,
        y: 0,
      }]);
    });

    it("should deal with complex case", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");

      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");

      const feat = gitgraph.branch("feat");
      feat.commit("six");

      dev.commit("seven");
      feat.commit("eight");
      master.commit("nine");
      dev.merge(feat);
      master.merge(dev);

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0, // master
        y: 80 * 10,
      }, {
        subject: "two",
        x: 0, // master
        y: 80 * 9,
      }, {
        subject: "three",
        x: 50, // dev
        y: 80 * 8,
      }, {
        subject: "four",
        x: 0, // master
        y: 80 * 7,
      }, {
        subject: "five",
        x: 50, // dev
        y: 80 * 6,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 5,
      },
      {
        subject: "seven",
        x: 50, // dev
        y: 80 * 4,
      },
      {
        subject: "eight",
        x: 50 * 2, // feat
        y: 80 * 3,
      },
      {
        subject: "nine",
        x: 0, // master
        y: 80 * 2,
      },
      {
        subject: "Merge branch feat",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0, // master
        y: 0,
      }]);
    });

    // TODO deal with commit style
    it.skip("should also be able to calculate position from git2json output", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

      gitgraph.commits = JSON.parse(
        readFileSync(join(__dirname, "./git2json-two-commits.json"), "utf-8"),
      );

      expect(commits).toMatchObject([
        {
          subject: "second",
          x: 0,
          y: 80,
        },
        {
          subject: "first",
          x: 0,
          y: 0,
        }]);
    });

    it("should deal with the compact mode", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({
        onRender: (c) => commits = c,
        mode: ModeEnum.Compact,
      });

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");

      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");

      const feat = gitgraph.branch("feat");
      feat.commit("six");

      dev.commit("seven");
      feat.commit("eight");
      master.commit("nine");
      dev.merge(feat);
      master.merge(dev);

      expect(commits).toMatchObject([{
        subject: "one",
        x: 0, // master
        y: 80 * 7,
      }, {
        subject: "two",
        x: 0, // master
        y: 80 * 6,
      }, {
        subject: "three",
        x: 50, // dev
        y: 80 * 5,
      }, {
        subject: "four",
        x: 0, // master
        y: 80 * 5,
      }, {
        subject: "five",
        x: 50, // dev
        y: 80 * 4,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 3,
      },
      {
        subject: "seven",
        x: 50, // dev
        y: 80 * 3,
      },
      {
        subject: "eight",
        x: 50 * 2, // feat
        y: 80 * 2,
      },
      {
        subject: "nine",
        x: 0, // master
        y: 80 * 2,
      },
      {
        subject: "Merge branch feat",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0, // master
        y: 0,
      }]);
    });
  });

  describe("tag", () => {
    it("should add a tag to a commit", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      const master = gitgraph.branch("master").commit({ subject: "one-tagged", hash: "one-tagged-hash" });
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit("four");
      gitgraph.tag("this-one", "one-tagged-hash");

      expect(gitgraph.tags.get("this-one")).toEqual("one-tagged-hash");
    });

    it("should add a tag to a branch", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit({ subject: "three-tagged", hash: "three-tagged-hash" });
      master.commit("four");
      gitgraph.tag("this-one", "dev");

      expect(gitgraph.tags.get("this-one")).toEqual("three-tagged-hash");
    });

    it("should add a tag to HEAD", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit({ subject: "four-tagged", hash: "four-tagged-hash" });
      gitgraph.tag("this-one");

      expect(gitgraph.tags.get("this-one")).toEqual("four-tagged-hash");
    });

    it("should add tags into render output", () => {
      let commits: Commit[];
      const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit("four-tagged");
      gitgraph.tag("tag-one").tag("tag-two");

      expect(commits).toMatchObject([
        { subject: "one", tags: [] },
        { subject: "two", tags: [] },
        { subject: "three", tags: [] },
        { subject: "four-tagged", tags: ["tag-one", "tag-two"] },
      ]);
    });
  });

  describe("render", () => {
    let gitgraph: GitgraphCore;

    beforeEach(() => {
      gitgraph = new GitgraphCore({ onRender: jest.fn() });
    });

    it("should call render method on render", () => {
      gitgraph.render();
      expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(1);
    });

    it("should call render on each commit", () => {
      gitgraph.commit().commit().commit();

      expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(3);
    });

    it("should call render on merge", () => {
      const master = gitgraph.branch("master").commit().commit().commit();
      const dev = gitgraph.branch("dev").commit().commit();
      master.merge(dev);

      expect((gitgraph.onRender as jest.Mock<GitgraphOptions["onRender"]>).mock.calls.length).toBe(6);
    });
  });

  describe("getBranchesPaths", () => {
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
  });
});
