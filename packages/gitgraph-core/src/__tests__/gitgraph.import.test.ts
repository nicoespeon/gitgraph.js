import { readFileSync } from "fs";
import { join } from "path";

import { GitgraphCore } from "../gitgraph";
import { Template } from "../template";

describe("Gitgraph.import", () => {
  describe("on invalid input", () => {
    const INVALID_INPUT_ERROR =
      "Only `git2json` format is supported for imported data.";

    it("should throw if input is not an array", () => {
      const gitgraph = new GitgraphCore().getUserApi();

      expect(() => gitgraph.import({})).toThrow(INVALID_INPUT_ERROR);
    });

    it("should throw if commits are not objects", () => {
      const gitgraph = new GitgraphCore().getUserApi();

      expect(() => gitgraph.import(["invalid-commit"])).toThrow(
        INVALID_INPUT_ERROR,
      );
    });

    it("should throw if commits refs are not array", () => {
      const gitgraph = new GitgraphCore().getUserApi();

      expect(() => gitgraph.import([{ refs: "invalid-refs" }])).toThrow(
        INVALID_INPUT_ERROR,
      );
    });
  });

  it("should render two commits from git2json", () => {
    const data = getImportData("git2json-two-commits");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();
    expect(commits).toMatchObject([
      {
        subject: "first",
        x: 0,
        y: 80,
      },
      {
        subject: "second",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should render two branches from git2json", () => {
    const data = getImportData("git2json-two-branches");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();
    expect(commits).toMatchObject([
      {
        subject: "first",
        x: 0,
        y: 160,
      },
      {
        subject: "second",
        x: 0,
        y: 80,
      },
      {
        subject: "third",
        x: 50,
        y: 0,
      },
    ]);
  });

  it("should compute style for two branches", () => {
    const data = getImportData("git2json-two-branches");
    const template = new Template({
      colors: ["red", "green", "blue"],
    });
    const core = new GitgraphCore({ template });
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();
    expect(commits).toMatchObject([
      {
        subject: "first",
        style: {
          color: "red",
        },
      },
      {
        subject: "second",
        style: {
          color: "red",
        },
      },
      {
        subject: "third",
        style: {
          color: "green",
        },
      },
    ]);
  });

  it("should compute tags", () => {
    const data = getImportData("git2json-tags");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();

    expect(commits[0].tags[0].name).toBe("stable");
    expect(commits[1].tags[0].name).toBe("v1.0");
  });

  it("should not put tags in refs", () => {
    const data = getImportData("git2json-tags");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();
    expect(commits).toMatchObject([
      {
        subject: "first",
        refs: [],
      },
      {
        subject: "second",
        refs: ["HEAD", "master"],
      },
    ]);
  });

  it("should handle deleted branches", () => {
    const data = getImportData("git2json-deleted-branch");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { commits } = core.getRenderedData();
    expect(commits).toMatchObject([
      {
        subject: "Initial commit",
        branches: ["master"],
      },
      {
        subject: "Add tooltips",
        branches: [""],
      },
      {
        subject: "Refactor code",
        branches: [""],
      },
      {
        subject: "Update README",
        branches: ["master"],
      },
      {
        subject: "Merge branch 'feat/tooltips'",
        branches: ["master"],
      },
    ]);
  });

  it("should compute correct branches paths for deleted branches", () => {
    const data = getImportData("git2json-deleted-branch");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { branchesPaths } = core.getRenderedData();
    const paths = Array.from(branchesPaths);
    expect(paths.length).toBe(2);
  });

  it("should compute merges in branches paths for deleted branches", () => {
    const data = getImportData("git2json-deleted-branch");
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.import(data);

    const { branchesPaths } = core.getRenderedData();
    const paths = Array.from(branchesPaths);
    expect(paths[0][1][0]).toEqual([
      { x: 0, y: 320 },
      { x: 0, y: 240 },
      { x: 0, y: 160 },
      { x: 0, y: 80 },
      { x: 0, y: 0 },
    ]);
    expect(paths[1][1][0]).toEqual([
      { x: 0, y: 320 },
      { x: 50, y: 240 },
      { x: 50, y: 160 },
      { x: 50, y: 80 },
      { x: 0, y: 0 },
    ]);
  });
});

function getImportData(name: string) {
  return JSON.parse(readFileSync(join(__dirname, `./${name}.json`), "utf-8"));
}
