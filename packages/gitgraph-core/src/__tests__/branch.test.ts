import "jest";
import GitGraph, { GitGraphCommitOptions } from "../gitgraph";
import Commit from "../commit";
import { BranchOptions } from "../branch";
const copy = (obj) => JSON.parse(JSON.stringify(obj));

describe("Branch", () => {

  class G extends GitGraph { public render(): void { return null; } }

  describe("commit", () => {
    describe("on HEAD", () => {
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
        expect(three.parents).toEqual([two.hash]);
      });
    });

    describe("with variables", () => {
      let one, two, three, four;

      beforeEach(() => {
        const gitgraph = new G();

        const master = gitgraph.branch("master");
        master.commit().commit(); // one, two
        const dev = gitgraph.branch("develop");
        dev.commit(); // tree
        master.commit(); // four

        [one, two, three, four] = gitgraph.log();
      });

      it("should have master tag on four commit", () => {
        expect(four.refs).toEqual(["master", "HEAD"]);
      });

      it("should have develop and head tags on three commit", () => {
        expect(three.refs).toEqual(["develop"]);
      });
    });

    describe("style", () => {
      let gitgraph: GitGraph;
      const templateCommitStyle = {
        color: null,
        dot: {
          color: null,
          lineDash: [],
          size: 14,
          strokeColor: null,
          strokeWidth: null,
        },
        message: {
          color: null,
          display: true,
          displayAuthor: true,
          displayBranch: true,
          displayHash: true,
          font: "normal 14pt Arial",
        },
        shouldDisplayTooltipsInCompactMode: true,
        spacing: 80,
        tag: {
          color: null,
          font: "normal 14pt Arial",
        },
        tooltipHTMLFormatter: null,
        widthExtension: 0,
      };
      beforeEach(() => {
        gitgraph = new G();
      });
      it("should have the style of the template by default", () => {
        gitgraph.commit();
        const [commit] = gitgraph.log();
        expect(commit.style).toEqual(templateCommitStyle);
      });

      it("should be have a merge style with the defaultCommitOptions", () => {
        gitgraph
          .branch({ commitDefaultOptions: { style: { message: { color: "green" } } } } as BranchOptions)
          .commit();

        const [commit] = gitgraph.log();
        const expected = copy(templateCommitStyle);
        expected.message.color = "green";
        expect(commit.style).toEqual(expected);
      });

      it("should be have a merge style with the commit", () => {
        gitgraph
          .branch({ commitDefaultOptions: { style: { message: { color: "green" } } } } as BranchOptions)
          .commit({ style: { message: { display: false } } } as GitGraphCommitOptions);

        const [commit] = gitgraph.log();
        const expected = copy(templateCommitStyle);
        expected.message.color = "green";
        expected.message.display = false;
        expect(commit.style).toEqual(expected);
      });
    });
  });

  describe("merge", () => {
    let log: Commit[];
    describe("with string parameter", () => {
      beforeEach(() => {
        const gitgraph = new G();

        const master = gitgraph.branch("master");
        master.commit("master 1"); // 0
        master.commit("master 2"); // 1

        const develop = gitgraph.branch("develop");
        develop.commit("develop 1"); // 2
        develop.commit("develop 2"); // 3
        develop.commit("develop 3"); // 4
        master.commit("master 3"); // 5

        master.merge("develop"); // 6 (merge with string)
        master.commit("master 4"); // 7

        log = gitgraph.log();
      });

      it("should create a merge commit into master", () => {
        const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
        expect(mergeCommit).toBeDefined();
      });

      it("should have 2 parents commits", () => {
        const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
        expect(mergeCommit.parents.length).toBe(2);
      });

      it("should throw if the branch doesn't exist", () => {
        const gitgraph = new G();

        const master = gitgraph.branch("master");
        master.commit("master 1");
        master.commit("master 2");
        expect(() => master.merge("no-exists")).toThrow(`The branch called "no-exists" is unknown`);
      });

      it("should have the last master commit as first parent and dev as second parent", () => {
        const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
        expect(mergeCommit.parents).toEqual([log[5].hash, log[4].hash]);
      });
    });

    describe("with branch parameter", () => {
      beforeEach(() => {
        const gitgraph = new G();

        const master = gitgraph.branch("master");
        master.commit("master 1");
        master.commit("master 2");

        const develop = gitgraph.branch("develop");
        develop.commit("develop 1");
        develop.commit("develop 2");
        develop.commit("develop 3");
        master.commit("master 3");

        master.merge(develop); // <- branch
        master.commit("master 4");

        log = gitgraph.log();
      });

      it("should create a merge commit into master", () => {
        const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
        expect(mergeCommit).toBeDefined();
      });

      it("should have 2 parents commits", () => {
        const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
        expect(mergeCommit.parents.length).toBe(2);
      });
    });
  });
});
