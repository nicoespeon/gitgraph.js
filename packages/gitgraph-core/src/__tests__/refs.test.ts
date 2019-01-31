import { Commit } from "../commit";
import { Refs } from "../refs";

const firstCommitHash: Commit["hash"] = "initialCommitHash";
const secondCommitHash: Commit["hash"] = "secondCommitHash";

describe("Refs", () => {
  let refs: Refs;

  beforeEach(() => {
    refs = new Refs();
    refs.set("master", firstCommitHash);
  });

  it("should return the commit referenced by a name", () => {
    expect(refs.getCommit("master")).toBe(firstCommitHash);
  });

  it("should return all the names referencing one commit", () => {
    refs.set("HEAD", firstCommitHash);

    expect(refs.getNames(firstCommitHash)).toEqual(["master", "HEAD"]);
  });

  it("should return an empty list if given reference name does not exist", () => {
    expect(refs.getNames("unknown")).toEqual([]);
  });

  it("should return undefined if given commit hash has no reference", () => {
    expect(refs.getCommit("unknown")).toBeUndefined();
  });

  it("should return true if given commit hash is referenced", () => {
    expect(refs.hasCommit(firstCommitHash)).toBe(true);
  });

  it("should return false if given commit hash is not referenced", () => {
    expect(refs.hasCommit(secondCommitHash)).toBe(false);
  });

  it("should return true if given name exists", () => {
    expect(refs.hasName("master")).toBe(true);
  });

  it("should return false if given name does not exist", () => {
    expect(refs.hasName("unknown")).toBe(false);
  });

  describe("update a ref", () => {
    beforeEach(() => {
      refs.set("master", secondCommitHash);
    });

    it("should return the new commit referenced by a name", () => {
      expect(refs.getCommit("master")).toBe(secondCommitHash);
    });

    it("should not be referenced by previous name anymore", () => {
      expect(refs.getNames(firstCommitHash)).toEqual([]);
    });
  });
});
