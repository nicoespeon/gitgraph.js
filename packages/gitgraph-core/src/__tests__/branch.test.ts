import { GitgraphCore, Commit } from "../index";

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
});
