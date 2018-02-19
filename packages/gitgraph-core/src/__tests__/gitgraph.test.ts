import "jest";
import { GitGraph, TemplateEnum } from "../gitgraph";

describe("GitGraph", () => {
  class G extends GitGraph { public render(): void { return null; } }

  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitGraph = new G();

      expect(gitgraph.options).toMatchObject({
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

      expect(gitgraph.options).toMatchObject({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        initCommitOffsetX: 0,
        initCommitOffsetY: 0,
        reverseArrow: true,
        template: "metro",
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
          //refs: ["HEAD", "master"],
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
          //refs: ["HEAD", "master"],
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
      // tslint:disable-next-line:one-variable-per-declaration
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
        expect(two.parents).toEqual([one.commit]);
        expect(two.parentsAbbrev).toEqual([one.commitAbbrev]);
      });
    });

    describe("branch", () => {
      describe("on HEAD", () => {
        // tslint:disable-next-line:one-variable-per-declaration
        let one, two, three;

        beforeEach(() => {
          const gitgraph = new G();

          gitgraph
            .commit()
            .commit()
            .branch("develop")
            .commit();

          [one, two, three] = gitgraph.log();
        });

        it("should keep master tag on the second commit", () => {
          expect(two.refs).toEqual(["master"]);
        });

        it("should have develop and head tags on the last commit", () => {
          expect(three.refs).toEqual(["develop", "HEAD"]);
        });

        it("should have the correct parents set", () => {
          expect(three.parents).toEqual([two.commit]);
        });
      });
    });

  });
});
