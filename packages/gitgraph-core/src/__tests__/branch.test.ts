import { GitgraphCore } from "../gitgraph";
import { Commit } from "../commit";

describe("Branch", () => {
  let log: Commit[];

  describe("merge with string parameter", () => {
    beforeEach(() => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

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
      const { commits } = core.getRenderedData();
      log = commits;
    });

    it("should be able to branch from hash", () => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

      const master = gitgraph.branch("master");
      const commitHash = "abc1234";
      master.commit({ subject: "one", hash: commitHash });
      master.commit("two");
      const fromHash = gitgraph.branch({
        name: "fromHash",
        from: commitHash,
      });
      fromHash.commit("three");

      const { commits } = core.getRenderedData();
      expect(commits[commits.length - 1].parents.length).toBe(1);
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
      const gitgraph = new GitgraphCore().getUserApi();

      const master = gitgraph.branch("master");
      master.commit("master 1");
      master.commit("master 2");
      expect(() => master.merge("no-exists")).toThrow(
        `The branch called "no-exists" is unknown`,
      );
    });

    it("should have the last master commit as first parent and dev as second parent", () => {
      const mergeCommit = log.find((c) => c.subject === "Merge branch develop");
      expect(mergeCommit.parents).toEqual([log[5].hash, log[4].hash]);
    });
  });

  describe("merge with branch parameter", () => {
    beforeEach(() => {
      const core = new GitgraphCore();
      const gitgraph = core.getUserApi();

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
      const { commits } = core.getRenderedData();
      log = commits;
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

  it("should fallback on template style for non-provided keys", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch({ name: "master", style: {} });
    const master = core.branches.get("master");

    expect(Object.keys(master.style).length).not.toBe(0);
  });

  it("should fallback on template style of label for non-provided keys", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch({ name: "master", style: { label: {} } });
    const master = core.branches.get("master");

    expect(Object.keys(master.style.label).length).not.toBe(0);
  });

  it("should override template style for provided keys", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch({ name: "master", style: { spacing: 12345 } });
    const master = core.branches.get("master");

    expect(master.style.spacing).toBe(12345);
  });

  describe("checkout", () => {
    describe("case: branch with commit", () => {
      let master, develop, refs;
      let masterLastCommit, developLastCommit;

      beforeEach(() => {
        const core = new GitgraphCore();
        const gitgraph = core.getUserApi();
        refs = core.refs;

        master = gitgraph.branch("master");
        master.commit("master 1");
        master.commit("master 2");

        develop = gitgraph.branch("develop");
        develop.commit("develop 1");
        develop.commit("develop 2");

        masterLastCommit = core.refs.getCommit("master");
        developLastCommit = core.refs.getCommit("develop");
      });

      it("should initialize 'HEAD' with the expected commit hash", () => {
        expect(refs.getCommit("HEAD")).toEqual(developLastCommit);
      });

      it("should move 'HEAD' to target branch after checkout", () => {
        expect(refs.getCommit("HEAD")).toEqual(developLastCommit);
        master.checkout();
        expect(refs.getCommit("HEAD")).toEqual(masterLastCommit);
      });
    });

    describe("case: branch without commit", () => {
      let master, develop, refs;

      beforeEach(() => {
        const core = new GitgraphCore();
        const gitgraph = core.getUserApi();
        refs = core.refs;

        master = gitgraph.branch("master");
        develop = gitgraph.branch("develop");
      });

      it("should not initialize 'HEAD'", () => {
        expect(refs.getCommit("HEAD")).toBeUndefined();
      });

      it("should not set 'HEAD' after checkout", () => {
        expect(refs.getCommit("HEAD")).toBeUndefined();
        master.checkout();
        expect(refs.getCommit("HEAD")).toBeUndefined();
      });
    });
  });

  describe("delete", () => {
    let gitgraph;
    let develop;
    let feature;

    beforeEach(() => {
      gitgraph = new GitgraphCore().getUserApi();

      develop = gitgraph.branch("develop");

      develop.commit("develop first");

      feature = gitgraph.branch("feature");

      feature.commit("feature first");
    });

    it("should be deleted and not referenced", () => {
      develop.checkout();

      feature.delete();

      expect(feature._branch.isDeleted() && !feature._isReferenced()).toBe(
        true,
      );
    });

    it("should leave commits and tags from the deleted branch in the graph", () => {
      feature.tag("some tag");

      const featureCommit = gitgraph._graph.refs.getCommit("feature");

      develop.checkout();

      feature.delete();

      expect(
        gitgraph._graph.commits.find(({ hash }) => hash === featureCommit) &&
          gitgraph._graph.refs.hasCommit(featureCommit) &&
          gitgraph._graph.tags.hasName("some tag"),
      ).toBe(true);
    });

    it("should throw if the branch is checked out", () => {
      expect(() => feature.delete()).toThrow(
        `Cannot delete the checked out branch "feature"`,
      );
    });

    it("should throw when branching from a deleted branch", () => {
      develop.checkout();

      feature.delete();

      expect(() => feature.branch("other-feature")).toThrow(
        `Cannot branch from the deleted branch "feature"`,
      );
    });

    it("should throw when committing on a deleted branch", () => {
      develop.checkout();

      feature.delete();

      expect(() => feature.commit("other commit")).toThrow(
        `Cannot commit on the deleted branch "feature"`,
      );
    });

    it("should silently do nothing when deleting twice", () => {
      develop.checkout();

      feature.delete();

      feature.delete();

      expect(feature._branch.isDeleted() && !feature._isReferenced()).toBe(
        true,
      );
    });

    it("should throw when merging a deleted branch to an existing one", () => {
      develop.checkout();

      feature.delete();

      expect(() => develop.merge(feature)).toThrow(
        `The branch called "feature" is unknown`,
      );
    });

    it("should throw when merging some branch to a deleted branch", () => {
      develop.checkout();

      feature.delete();

      expect(() => feature.merge(develop)).toThrow(
        `Cannot merge to the deleted branch "feature"`,
      );
    });

    it("should throw when tagging on a deleted branch", () => {
      develop.checkout();

      feature.delete();

      expect(() => feature.tag("some tag")).toThrow(
        `Cannot tag on the deleted branch "feature"`,
      );
    });

    it("should throw when checking out a deleted branch", () => {
      develop.checkout();

      feature.delete();

      expect(() => feature.checkout()).toThrow(
        `Cannot checkout the deleted branch "feature"`,
      );
    });
  });
});
