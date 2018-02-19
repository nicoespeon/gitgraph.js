import "jest";
import GitGraph from "../gitgraph";

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
        expect(three.parents).toEqual([two.commit]);
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
        expect(four.refs).toEqual(["master"]);
      });

      it("should have develop and head tags on three commit", () => {
        expect(three.refs).toEqual(["develop", "HEAD"]);
      });
    });
  });
});
