import "jest";
import { GitgraphCore, Commit, OrientationsEnum, ModeEnum } from "../index";
import { readFileSync } from "fs";
import { join } from "path";

describe("Gitgraph.withPosition", () => {
  it("should deal with 3 straight commits", () => {
    const gitgraph = new GitgraphCore();
    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 160,
      },
      {
        subject: "two",
        x: 0,
        y: 80,
      },
      {
        subject: "three",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should deal with 3 straight commits (reverse)", () => {
    const gitgraph = new GitgraphCore({
      orientation: OrientationsEnum.VerticalReverse,
    });
    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 0,
      },
      {
        subject: "two",
        x: 0,
        y: 80,
      },
      {
        subject: "three",
        x: 0,
        y: 160,
      },
    ]);
  });

  it("should deal with 3 straight commits (horizontal)", () => {
    const gitgraph = new GitgraphCore({
      orientation: OrientationsEnum.Horizontal,
    });
    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 0,
      },
      {
        subject: "two",
        x: 80,
        y: 0,
      },
      {
        subject: "three",
        x: 160,
        y: 0,
      },
    ]);
  });

  it("should deal with 3 straight commits (horizontal-reverse)", () => {
    const gitgraph = new GitgraphCore({
      orientation: OrientationsEnum.HorizontalReverse,
    });
    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 160,
        y: 0,
      },
      {
        subject: "two",
        x: 80,
        y: 0,
      },
      {
        subject: "three",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should deal one branch (no merge)", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 80 * 4,
      },
      {
        subject: "two",
        x: 0,
        y: 80 * 3,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 2,
      },
      {
        subject: "four",
        x: 0,
        y: 80,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 0,
      },
    ]);
  });

  it("should deal with two branches (no merge)", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    const feat = gitgraph.branch("feat");
    feat.commit("six");

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 80 * 5,
      },
      {
        subject: "two",
        x: 0,
        y: 80 * 4,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 3,
      },
      {
        subject: "four",
        x: 0,
        y: 80 * 2,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 80 * 1,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 0,
      },
    ]);
  });

  it("should deal with one branch (with merge)", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 80 * 5,
      },
      {
        subject: "two",
        x: 0,
        y: 80 * 4,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 3,
      },
      {
        subject: "four",
        x: 0,
        y: 80 * 2,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should deal with one branch (with merge) (vertical-reverse)", () => {
    const gitgraph = new GitgraphCore({orientation: OrientationsEnum.VerticalReverse});

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 0,
      },
      {
        subject: "two",
        x: 0,
        y: 80,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 2,
      },
      {
        subject: "four",
        x: 0,
        y: 80 * 3,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 80 * 4,
      },
      {
        subject: "Merge branch dev",
        x: 0,
        y: 80 * 5,
      },
    ]);
  });

  it("should deal with one branch (with merge) (horizontal)", () => {
    const gitgraph = new GitgraphCore({orientation: OrientationsEnum.Horizontal});

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 0,
      },
      {
        subject: "two",
        x: 80,
        y: 0,
      },
      {
        subject: "three",
        x: 80 * 2, // dev
        y: 50,
      },
      {
        subject: "four",
        x: 80 * 3,
        y: 0,
      },
      {
        subject: "five",
        x: 80 * 4, // dev
        y: 50,
      },
      {
        subject: "Merge branch dev",
        x: 80 * 5,
        y: 0,
      },
    ]);
  });

  it("should deal with one branch (with merge) (horizontal-reverse)", () => {
    const gitgraph = new GitgraphCore({orientation: OrientationsEnum.HorizontalReverse});

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 80 * 5,
        y: 0,
      },
      {
        subject: "two",
        x: 80 * 4,
        y: 0,
      },
      {
        subject: "three",
        x: 80 * 3, // dev
        y: 50,
      },
      {
        subject: "four",
        x: 80 * 2,
        y: 0,
      },
      {
        subject: "five",
        x: 80, // dev
        y: 50,
      },
      {
        subject: "Merge branch dev",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should deal with complex case", () => {
    const gitgraph = new GitgraphCore();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const feat = gitgraph.branch("feat");
    feat.commit("six");

    dev.commit("seven");
    feat.commit("eight");
    master.commit("nine");
    dev.merge(feat);
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0, // master
        y: 80 * 10,
      },
      {
        subject: "two",
        x: 0, // master
        y: 80 * 9,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 8,
      },
      {
        subject: "four",
        x: 0, // master
        y: 80 * 7,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 80 * 6,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 5,
      },
      {
        subject: "seven",
        x: 50, // dev
        y: 80 * 4,
      },
      {
        subject: "eight",
        x: 50 * 2, // feat
        y: 80 * 3,
      },
      {
        subject: "nine",
        x: 0, // master
        y: 80 * 2,
      },
      {
        subject: "Merge branch feat",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0, // master
        y: 0,
      },
    ]);
  });

  // TODO deal with commit style
  it.skip("should also be able to calculate position from git2json output", () => {
    const gitgraph = new GitgraphCore();

    gitgraph.commits = JSON.parse(
      readFileSync(join(__dirname, "./git2json-two-commits.json"), "utf-8"),
    );

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

  it("should deal with the compact mode", () => {
    const gitgraph = new GitgraphCore({
      mode: ModeEnum.Compact,
    });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const feat = gitgraph.branch("feat");
    feat.commit("six");

    dev.commit("seven");
    feat.commit("eight");
    master.commit("nine");
    dev.merge(feat);
    master.merge(dev);

    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0, // master
        y: 80 * 7,
      },
      {
        subject: "two",
        x: 0, // master
        y: 80 * 6,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 5,
      },
      {
        subject: "four",
        x: 0, // master
        y: 80 * 5,
      },
      {
        subject: "five",
        x: 50, // dev
        y: 80 * 4,
      },
      {
        subject: "six",
        x: 50 * 2, // feat
        y: 80 * 3,
      },
      {
        subject: "seven",
        x: 50, // dev
        y: 80 * 3,
      },
      {
        subject: "eight",
        x: 50 * 2, // feat
        y: 80 * 2,
      },
      {
        subject: "nine",
        x: 0, // master
        y: 80 * 2,
      },
      {
        subject: "Merge branch feat",
        x: 50, // dev
        y: 80,
      },
      {
        subject: "Merge branch dev",
        x: 0, // master
        y: 0,
      },
    ]);
  });
});
