import "jest";
import { GitGraph, TemplateEnum, OrientationsEnum } from "../gitgraph";
import { metroTemplate } from "../template";

describe("GitGraph", () => {
  class G extends GitGraph { public render(): void { return null; } }

  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitGraph = new G();

      expect(gitgraph).toMatchObject({
        author: "Sergio Flores <saxo-guy@epic.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: false,
      });
    });

    it("should be able to override options", () => {
      const gitgraph: GitGraph = new G({
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
        const gitgraph: GitGraph = new G();

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
        const gitgraph: GitGraph = new G();

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
        const gitgraph: GitGraph = new G();

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
        const gitgraph: GitGraph = new G();

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

  describe("withBranches", () => {
    it("should deal one branch (no merge)", () => {
      const gitgraph: GitGraph = new G();

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
      const gitgraph: GitGraph = new G();

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
      const gitgraph: GitGraph = new G();
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
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.VerticalReverse });
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
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.Horizontal });
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
      const gitgraph: GitGraph = new G({ orientation: OrientationsEnum.HorizontalReverse });
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
      const gitgraph: GitGraph = new G();

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

    it("should deal one branch (with merge)", () => {
      const gitgraph: GitGraph = new G();

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
  });
});
