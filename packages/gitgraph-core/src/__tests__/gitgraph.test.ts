import "jest";
import { GitgraphCore, TemplateEnum, OrientationsEnum, ModeEnum } from "../gitgraph";
import Commit from "../commit";
import { metroTemplate } from "../template";
import { readFileSync } from "fs";
import { join } from "path";
import { debug } from "../utils";

describe("Gitgraph", () => {
  class G extends GitgraphCore { public render(): void { return null; } }

  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitgraphCore = new G();

      expect(gitgraph).toMatchObject({
        author: "Sergio Flores <saxo-guy@epic.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: false,
      });
    });

    it("should be able to override options", () => {
      const gitgraph: GitgraphCore = new G({
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
        const gitgraph: GitgraphCore = new G();

        gitgraph.commit({ subject: "Initial commit" });

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
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
        const gitgraph: GitgraphCore = new G();

        gitgraph.commit({ subject: "Initial commit", author: "Fabien BERNARD <fabien0102@gmail.com>" });

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
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
        const gitgraph: GitgraphCore = new G();

        gitgraph.commit("Initial commit");

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("Initial commit");
      });

      it("should works without argument (default message)", () => {
        const gitgraph = new G();
        gitgraph.commit();

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("He doesn't like George Michael! Boooo!");
      });
    });

    describe("two commits", () => {
      let one, two;
      beforeEach(() => {
        const gitgraph: GitgraphCore = new G();

        gitgraph
          .commit("Initial commit")
          .commit("Second commit");

        [one, two] = gitgraph.log();
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
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");

      gitgraph.clear();
      expect(gitgraph.log()).toEqual([]);
      expect(gitgraph.refs.values()).toEqual([]);
    });

    it("should reset the currentBranch", () => {
      const gitgraph = new G();
      const dev = gitgraph.branch("dev").checkout();
      expect(gitgraph.currentBranch.name).toBe("dev");

      gitgraph.clear();
      expect(gitgraph.currentBranch.name).toBe("master");
    });

    it("should be able to add normally a commit after a clear", () => {
      const gitgraph = new G();
      gitgraph.branch("dev").commit("one").commit("two");
      gitgraph.clear();
      gitgraph.branch("feat").commit("three").commit("four");

      expect(gitgraph.log()).toMatchObject([
        { subject: "three", branches: ["feat"] },
        { subject: "four", branches: ["feat"] },
      ]);
    });
  });

  describe("withBranches", () => {
    it("should deal one branch (no merge)", () => {
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");
      master.merge(dev);

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G();
      gitgraph.commit("one").commit("two").commit("three");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G({ orientation: OrientationsEnum.VerticalReverse });
      gitgraph.commit("one").commit("two").commit("three");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G({ orientation: OrientationsEnum.Horizontal });
      gitgraph.commit("one").commit("two").commit("three");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G({ orientation: OrientationsEnum.HorizontalReverse });
      gitgraph.commit("one").commit("two").commit("three");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");
      const feat = gitgraph.branch("feat");
      feat.commit("six");

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph: GitgraphCore = new G();

      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      dev.commit("three");
      master.commit("four");
      dev.commit("five");
      master.merge(dev);

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph = new G();

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

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph = new G();

      gitgraph.commits = JSON.parse(
        readFileSync(join(__dirname, "./git2json-two-commits.json"), "utf-8"),
      );

      expect(gitgraph.log()).toMatchObject([
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
      const gitgraph = new G({ mode: ModeEnum.Compact });

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

      expect(gitgraph.log()).toMatchObject([{
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
      const gitgraph = new G();
      const master = gitgraph.branch("master").commit({ subject: "one-tagged", hash: "this-is-the-sha1-of-my-commit" });
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit("four");
      gitgraph.tag("this-one", "this-is-the-sha1-of-my-commit");

      expect((gitgraph.tags.get("this-one") as Commit).subject).toEqual("one-tagged");
    });

    it("should add a tag to a branch", () => {
      const gitgraph = new G();
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit("three-tagged");
      master.commit("four");
      gitgraph.tag("this-one", "dev");

      expect((gitgraph.tags.get("this-one") as Commit).subject).toEqual("three-tagged");
    });

    it("should add a tag to HEAD", () => {
      const gitgraph = new G();
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit("four-tagged");
      gitgraph.tag("this-one");

      expect((gitgraph.tags.get("this-one") as Commit).subject).toEqual("four-tagged");
    });

    it("should add tags into log() output", () => {
      const gitgraph = new G();
      const master = gitgraph.branch("master").commit("one");
      const dev = gitgraph.branch("dev").commit("two").commit("three");
      master.commit("four-tagged");
      gitgraph.tag("tag-one").tag("tag-two");

      expect(gitgraph.log()).toMatchObject([
        { subject: "one", tags: [] },
        { subject: "two", tags: [] },
        { subject: "three", tags: [] },
        { subject: "four-tagged", tags: ["tag-one", "tag-two"] },
      ]);
    });
  });

  describe("render", () => {
    let renderMock: jest.Mock<any>;
    // tslint:disable-next-line:max-classes-per-file
    class GitgraphRender extends GitgraphCore { public render(): void { return renderMock(); } }

    beforeEach(() => {
      renderMock = jest.fn();
    });

    it("should call render method on render", () => {
      const gitgraph = new GitgraphRender();
      gitgraph.render();
      expect(renderMock.mock.calls.length).toBe(1);
    });

    it("should call render on each commit", () => {
      const gitgraph = new GitgraphRender();
      gitgraph.commit().commit().commit();

      expect(renderMock.mock.calls.length).toBe(3);
    });

    it("should call render on merge", () => {
      const gitgraph = new GitgraphRender();
      const master = gitgraph.branch("master").commit().commit().commit();
      const dev = gitgraph.branch("dev").commit().commit();
      master.merge(dev);

      expect(renderMock.mock.calls.length).toBe(6); // 5 commits + 1 merge commit
    });
  });
});
