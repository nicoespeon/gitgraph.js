import "jest";
import { GitGraph, TemplateEnum } from "../gitgraph";

describe("GitGraph", () => {
  class G extends GitGraph { public render(): void { return null; } }

  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitGraph = new G();

      expect(gitgraph.options.author).toBe("Sergio Flores <saxo-guy@epic.com>");
      expect(gitgraph.options.initCommitOffsetX).toBe(0);
      expect(gitgraph.options.initCommitOffsetY).toBe(0);
      expect(gitgraph.options.reverseArrow).toBeFalsy();
    });

    it("should be able to override options", () => {
      const gitgraph: GitGraph = new G({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        reverseArrow: true,
        template: TemplateEnum.Metro,
      });

      expect(gitgraph.options.author).toBe("Fabien BERNARD <fabien0102@gmail.com>");
      expect(gitgraph.options.initCommitOffsetX).toBe(0);
      expect(gitgraph.options.initCommitOffsetY).toBe(0);
      expect(gitgraph.options.reverseArrow).toBeTruthy();
      expect(gitgraph.options.template).toBe("metro");
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
        expect(commit.subject).toBe("Initial commit");
        expect(commit.refs).toEqual(["master", "HEAD"]);
        expect(commit.author.name).toEqual("Sergio Flores");
        expect(commit.author.email).toEqual("saxo-guy@epic.com");
        expect(commit.committer.name).toEqual("Sergio Flores");
        expect(commit.committer.email).toEqual("saxo-guy@epic.com");
      });

      it("should add the initial commit with another author", () => {
        const gitgraph: GitGraph = new G();

        gitgraph.commit({ subject: "Initial commit", author: "Fabien BERNARD <fabien0102@gmail.com>" });

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("Initial commit");
        expect(commit.refs).toEqual(["master", "HEAD"]);
        expect(commit.author.name).toEqual("Fabien BERNARD");
        expect(commit.author.email).toEqual("fabien0102@gmail.com");
        expect(commit.committer.name).toEqual("Fabien BERNARD");
        expect(commit.committer.email).toEqual("fabien0102@gmail.com");
      });
      it("should works with the shorter commit message syntax", () => {
        const gitgraph: GitGraph = new G();

        gitgraph.commit("Initial commit");

        const log = gitgraph.log();
        const [commit] = log;

        expect(log.length).toBe(1);
        expect(commit.subject).toBe("Initial commit");
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

        const log = gitgraph.log();
        [one, two] = log;
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

  });
});
