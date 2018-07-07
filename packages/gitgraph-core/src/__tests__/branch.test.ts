import "jest";
import {
  GitgraphCore,
  GitgraphCommitOptions,
  Commit,
  BranchOptions,
  metroTemplate,
} from "../index";
import { OrientationsEnum, ModeEnum } from "../gitgraph";
const copy = (obj) => JSON.parse(JSON.stringify(obj));

describe("Branch", () => {
  describe("commit", () => {
    describe("on HEAD", () => {
      let one, two, three;

      beforeEach(() => {
        const gitgraph = new GitgraphCore();

        gitgraph
          .commit()
          .commit()
          .branch("develop")
          .commit();

        const { commits } = gitgraph.getRenderedData();
        [one, two, three] = commits;
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

    describe("on branches", () => {
      it("should have master on commit two", () => {
        const gitgraph = new GitgraphCore();

        const master = gitgraph.branch("master");
        master.commit("one").commit("two");
        const dev = gitgraph.branch("develop");
        dev.commit("three");

        const { commits } = gitgraph.getRenderedData();

        expect(commits).toMatchObject([
          { subject: "one", refs: [] },
          { subject: "two", refs: ["master"] },
          { subject: "three", refs: ["develop", "HEAD"] },
        ]);
      });

      it("should have master and HEAD on commit four", () => {
        const gitgraph = new GitgraphCore();

        const master = gitgraph.branch("master");
        master.commit("one").commit("two");
        const dev = gitgraph.branch("develop");
        dev.commit("three");
        master.commit("four");

        const { commits } = gitgraph.getRenderedData();

        expect(commits).toMatchObject([
          { subject: "one", refs: [] },
          { subject: "two", refs: [] },
          { subject: "three", refs: ["develop"] },
          { subject: "four", refs: ["master", "HEAD"] },
        ]);
      });
    });

    describe("style", () => {
      let gitgraph: GitgraphCore;

      const expectedStyle = {
        color: "#979797",
        dot: {
          color: "#979797",
          lineDash: [],
          size: 14,
          strokeColor: null,
          strokeWidth: null,
        },
        message: {
          color: "#979797",
          display: true,
          displayAuthor: true,
          displayBranch: true,
          displayHash: true,
          font: "normal 14pt Arial",
        },
        shouldDisplayTooltipsInCompactMode: true,
        spacing: 80,
        tag: {
          color: "#979797",
          font: "normal 14pt Arial",
        },
        tooltipHTMLFormatter: null,
        widthExtension: 0,
      };

      beforeEach(() => {
        gitgraph = new GitgraphCore();
      });

      it("should have the style of the template by default", () => {
        gitgraph.commit();
        const { commits } = gitgraph.getRenderedData();
        const [commit] = commits;
        expect(commit.style).toEqual(expectedStyle);
      });

      it("should be have a merge style with the defaultCommitOptions", () => {
        gitgraph
          .branch({
            commitDefaultOptions: { style: { message: { color: "green" } } },
          } as BranchOptions)
          .commit();

        const { commits } = gitgraph.getRenderedData();
        const [commit] = commits;
        const expected = copy(expectedStyle);
        expected.message.color = "green";
        expect(commit.style).toEqual(expected);
      });

      it("should be have a merge style with the commit", () => {
        gitgraph
          .branch({
            commitDefaultOptions: { style: { message: { color: "green" } } },
          } as BranchOptions)
          .commit({
            style: { message: { display: false } },
          } as GitgraphCommitOptions);

        const { commits } = gitgraph.getRenderedData();
        const [commit] = commits;
        const expected = copy(expectedStyle);
        expected.message.color = "green";
        expected.message.display = false;
        expect(commit.style).toEqual(expected);
      });

      it("should have the color depending of the branch (metro theme)", () => {
        const master = gitgraph.branch("master").commit("one");
        const dev = gitgraph.branch("dev").commit("two");
        master.merge(dev);
        gitgraph.branch("feat1").commit("three");
        gitgraph.branch("feat2").commit("four");
        gitgraph.branch("feat3").commit("five");

        const { colors } = metroTemplate;
        const { commits } = gitgraph.getRenderedData();

        expect(commits).toMatchObject([
          {
            subject: "one",
            style: {
              color: colors[0],
              message: { color: colors[0] },
              tag: { color: colors[0] },
              dot: { color: colors[0] },
            },
          },
          {
            subject: "two",
            style: {
              color: colors[1],
              message: { color: colors[1] },
              tag: { color: colors[1] },
              dot: { color: colors[1] },
            },
          },
          {
            subject: "Merge branch dev",
          },
          {
            subject: "three",
            style: {
              color: colors[2],
              message: { color: colors[2] },
              tag: { color: colors[2] },
              dot: { color: colors[2] },
            },
          },
          {
            subject: "four",
            style: {
              color: colors[0],
              message: { color: colors[0] },
              tag: { color: colors[0] },
              dot: { color: colors[0] },
            },
          },
          {
            subject: "five",
            style: {
              color: colors[1],
              message: { color: colors[1] },
              tag: { color: colors[1] },
              dot: { color: colors[1] },
            },
          },
        ]);
      });

      it("should hide commit message if orientation is horizontal", () => {
        const gitgraphHorizontal = new GitgraphCore({
          orientation: OrientationsEnum.Horizontal,
        });
        gitgraphHorizontal.commit();

        const { commits } = gitgraphHorizontal.getRenderedData();
        const [commit] = commits;

        expect(commit.style.message.display).toBe(false);
      });

      it("should hide commit message if orientation is horizontal-reverse", () => {
        const gitgraphHorizontalReverse = new GitgraphCore({
          orientation: OrientationsEnum.HorizontalReverse,
        });
        gitgraphHorizontalReverse.commit();

        const { commits } = gitgraphHorizontalReverse.getRenderedData();
        const [commit] = commits;

        expect(commit.style.message.display).toBe(false);
      });

      it("should hide commit message if mode is compact", () => {
        const gitgraphCompact = new GitgraphCore({
          mode: ModeEnum.Compact,
        });
        gitgraphCompact.commit();

        const { commits } = gitgraphCompact.getRenderedData();
        const [commit] = commits;

        expect(commit.style.message.display).toBe(false);
      });
    });

    describe("with tag", () => {
      const gitgraph = new GitgraphCore();
      gitgraph
        .commit("one")
        .commit({ subject: "with tag", tag: "1.0.0" })
        .commit("three");
      const { commits } = gitgraph.getRenderedData();
      expect(commits).toMatchObject([
        { subject: "one" },
        { subject: "with tag", tags: ["1.0.0"] },
        { subject: "three" },
      ]);
    });
  });

  describe("merge", () => {
    let log: Commit[];
    describe("with string parameter", () => {
      beforeEach(() => {
        const gitgraph = new GitgraphCore();

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
        const { commits } = gitgraph.getRenderedData();
        log = commits;
      });

      it("should create a merge commit into master", () => {
        const mergeCommit = log.find(
          (c) => c.subject === "Merge branch develop",
        );
        expect(mergeCommit).toBeDefined();
      });

      it("should have 2 parents commits", () => {
        const mergeCommit = log.find(
          (c) => c.subject === "Merge branch develop",
        );
        expect(mergeCommit.parents.length).toBe(2);
      });

      it("should throw if the branch doesn't exist", () => {
        const gitgraph = new GitgraphCore();

        const master = gitgraph.branch("master");
        master.commit("master 1");
        master.commit("master 2");
        expect(() => master.merge("no-exists")).toThrow(
          `The branch called "no-exists" is unknown`,
        );
      });

      it("should have the last master commit as first parent and dev as second parent", () => {
        const mergeCommit = log.find(
          (c) => c.subject === "Merge branch develop",
        );
        expect(mergeCommit.parents).toEqual([log[5].hash, log[4].hash]);
      });
    });

    describe("with branch parameter", () => {
      beforeEach(() => {
        const gitgraph = new GitgraphCore();

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
        const { commits } = gitgraph.getRenderedData();
        log = commits;
      });

      it("should create a merge commit into master", () => {
        const mergeCommit = log.find(
          (c) => c.subject === "Merge branch develop",
        );
        expect(mergeCommit).toBeDefined();
      });

      it("should have 2 parents commits", () => {
        const mergeCommit = log.find(
          (c) => c.subject === "Merge branch develop",
        );
        expect(mergeCommit.parents.length).toBe(2);
      });
    });
  });

  describe("tag", () => {
    it("should tag the last commit of the branch", () => {
      const gitgraph = new GitgraphCore();

      const master = gitgraph.branch("master");
      const dev = gitgraph
        .branch("dev")
        .commit("one")
        .commit({ subject: "two-tagged", hash: "two-tagged-hash" })
        .tag("this-one");

      master.commit("three");
      dev.commit("four");

      expect(gitgraph.tags.get("this-one")).toEqual("two-tagged-hash");
    });
  });
});
