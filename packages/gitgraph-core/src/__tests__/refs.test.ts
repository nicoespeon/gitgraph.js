import "jest";
import Commit from "../commit";
import Refs from "../refs";

const initialCommitHash: Commit["hash"] = "initialCommitHash";

const secondCommitHash: Commit["hash"] = "secondCommitHash";

describe("Refs", () => {
  let refs: Refs;

  beforeEach(() => {
    refs = new Refs();
    refs.set("master", initialCommitHash);
  });

  it("should return the initial commit behind master ref", () => {
    expect(refs.get("master")).toBe(initialCommitHash);
  });

  it("should return all the refs connected to one commit", () => {
    refs.set("HEAD", initialCommitHash);
    expect(refs.get(initialCommitHash)).toEqual(["master", "HEAD"]);
  });

  it("should return undefined if the ref not exists", () => {
    expect(refs.get("not-exists")).toBeUndefined();
  });

  describe("update a ref", () => {
    beforeEach(() => {
      refs.set("master", secondCommitHash);
    });

    it("should return the second commit behind master ref", () => {
      expect(refs.get("master")).toBe(secondCommitHash);
    });

    it("should remove the initial commit link", () => {
      expect(refs.get(initialCommitHash)).toEqual([]);
    });
  });
});
