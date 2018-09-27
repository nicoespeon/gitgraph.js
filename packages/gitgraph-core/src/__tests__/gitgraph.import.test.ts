import { readFileSync } from "fs";
import { join } from "path";
import { GitgraphCore } from "../gitgraph";
import { Template } from "../template";

describe("Gitgraph.import", () => {
  describe("on invalid input", () => {
    it("should throw if input is not an array", () => {
      const gitgraph = new GitgraphCore();

      expect(() => gitgraph.import({})).toThrow();
    });

    it("should throw if commits are not objects", () => {
      const gitgraph = new GitgraphCore();

      expect(() => gitgraph.import(["invalid-commit"])).toThrow();
    });

    it("should throw if commits refs are not array", () => {
      const gitgraph = new GitgraphCore();

      expect(() => gitgraph.import([{ refs: "invalid-refs" }])).toThrow();
    });
  });

  it("should render two commits from git2json", () => {
    const data = getImportData("git2json-two-commits");

    const gitgraph = new GitgraphCore();
    gitgraph.import(data);
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "second",
        x: 0,
        y: 80,
      },
      {
        subject: "first",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should render two branches from git2json", () => {
    const data = getImportData("git2json-two-branches");

    const gitgraph = new GitgraphCore();
    gitgraph.import(data);
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "third",
        x: 0,
        y: 160,
      },
      {
        subject: "second",
        x: 50,
        y: 80,
      },
      {
        subject: "first",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should compute style for 2 branches", () => {
    const data = getImportData("git2json-two-branches");

    const template = new Template({
      colors: ["red", "green", "blue"],
    });
    const gitgraph = new GitgraphCore({ template });
    gitgraph.import(data);
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "third",
        style: {
          color: "red",
        },
      },
      {
        subject: "second",
        style: {
          color: "green",
        },
      },
      {
        subject: "first",
        style: {
          color: "red",
        },
      },
    ]);
  });

  it("should compute tags", () => {
    const data = getImportData("git2json-tags");

    const gitgraph = new GitgraphCore();
    gitgraph.import(data);
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "second",
        tags: ["v1.0"],
      },
      {
        subject: "first",
        tags: ["stable"],
      },
    ]);
  });

  it("should not put tags in refs", () => {
    const data = getImportData("git2json-tags");

    const gitgraph = new GitgraphCore();
    gitgraph.import(data);
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "second",
        refs: ["HEAD", "master"],
      },
      {
        subject: "first",
        refs: [],
      },
    ]);
  });
});

function getImportData(name: string) {
  return JSON.parse(readFileSync(join(__dirname, `./${name}.json`), "utf-8"));
}
