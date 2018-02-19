import "jest";
import Commit from "../commit";
import Refs from "../refs";

const initialCommit = new Commit(
  {
    author: "fabien0102",
    subject: "Initial commit",
  });

const secondCommit = new Commit(
  {
    author: "fabien0102",
    subject: "second commit",
  });

describe.only("Refs", () => {
  let refs: Refs;

  beforeEach(() => {
    refs = new Refs();
    refs.set("master", initialCommit);
  });

  it("should return the initial commit behind master ref", () => {
    expect(refs.get("master")).toBe(initialCommit);
  });

  it("should return all the refs connected to one commit", () => {
    refs.set("HEAD", initialCommit);
    expect(refs.get(initialCommit)).toEqual(["master", "HEAD"]);
  });

  it("should return undefined if the ref not exists", () => {
    expect(refs.get("not-exists")).toBeUndefined();
  });

  describe("update a ref", () => {
    beforeEach(() => {
      refs.set("master", secondCommit);
    });

    it("should return the second commit behind master ref", () => {
      expect(refs.get("master")).toBe(secondCommit);
    });

    it("should remove the initial commit link", () => {
      expect(refs.get(initialCommit)).toEqual([]);
    });
  });
});
