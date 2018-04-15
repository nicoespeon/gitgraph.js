import "jest";
import {GitgraphCore, Commit, OrientationsEnum, ModeEnum} from "../index";
import { readFileSync } from "fs";
import { join } from "path";

describe("Gitgraph.withPosition", () => {
  it("should deal with 3 straight commits", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });
    gitgraph.commit("one").commit("two").commit("three");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 160,
    }, {
      subject: "two",
      x: 0,
      y: 80,
    }, {
      subject: "three",
      x: 0,
      y: 0,
    }]);
  });

  it("should deal with 3 straight commits (reverse)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({
      onRender: (c) => commits = c,
      orientation: OrientationsEnum.VerticalReverse,
    });
    gitgraph.commit("one").commit("two").commit("three");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 0,
    }, {
      subject: "two",
      x: 0,
      y: 80,
    }, {
      subject: "three",
      x: 0,
      y: 160,
    }]);
  });

  it("should deal with 3 straight commits (horizontal)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({
      onRender: (c) => commits = c,
      orientation: OrientationsEnum.Horizontal,
    });
    gitgraph.commit("one").commit("two").commit("three");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 0,
    }, {
      subject: "two",
      x: 80,
      y: 0,
    }, {
      subject: "three",
      x: 160,
      y: 0,
    }]);
  });

  it("should deal with 3 straight commits (horizontal-reverse)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({
      onRender: (c) => commits = c,
      orientation: OrientationsEnum.HorizontalReverse,
    });
    gitgraph.commit("one").commit("two").commit("three");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 160,
      y: 0,
    }, {
      subject: "two",
      x: 80,
      y: 0,
    }, {
      subject: "three",
      x: 0,
      y: 0,
    }]);
  });

  it("should deal one branch (no merge)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 80 * 4,
    }, {
      subject: "two",
      x: 0,
      y: 80 * 3,
    }, {
      subject: "three",
      x: 50, // dev
      y: 80 * 2,
    }, {
      subject: "four",
      x: 0,
      y: 80,
    }, {
      subject: "five",
      x: 50, // dev
      y: 0,
    }]);
  });

  it("should deal two branches (no merge)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    const feat = gitgraph.branch("feat");
    feat.commit("six");

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 80 * 5,
    }, {
      subject: "two",
      x: 0,
      y: 80 * 4,
    }, {
      subject: "three",
      x: 50, // dev
      y: 80 * 3,
    }, {
      subject: "four",
      x: 0,
      y: 80 * 2,
    }, {
      subject: "five",
      x: 50, // dev
      y: 80 * 1,
    },
    {
      subject: "six",
      x: 50 * 2, // feat
      y: 80 * 0,
    }]);
  });

  it("should deal one branch (with merge)", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0,
      y: 80 * 5,
    }, {
      subject: "two",
      x: 0,
      y: 80 * 4,
    }, {
      subject: "three",
      x: 50, // dev
      y: 80 * 3,
    }, {
      subject: "four",
      x: 0,
      y: 80 * 2,
    }, {
      subject: "five",
      x: 50, // dev
      y: 80,
    },
    {
      subject: "Merge branch dev",
      x: 0,
      y: 0,
    }]);
  });

  it("should deal with complex case", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

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

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0, // master
      y: 80 * 10,
    }, {
      subject: "two",
      x: 0, // master
      y: 80 * 9,
    }, {
      subject: "three",
      x: 50, // dev
      y: 80 * 8,
    }, {
      subject: "four",
      x: 0, // master
      y: 80 * 7,
    }, {
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
    }]);
  });

  // TODO deal with commit style
  it.skip("should also be able to calculate position from git2json output", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({ onRender: (c) => commits = c });

    gitgraph.commits = JSON.parse(
      readFileSync(join(__dirname, "./git2json-two-commits.json"), "utf-8"),
    );

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
      }]);
  });

  it("should deal with the compact mode", () => {
    let commits: Commit[];
    const gitgraph = new GitgraphCore({
      onRender: (c) => commits = c,
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

    expect(commits).toMatchObject([{
      subject: "one",
      x: 0, // master
      y: 80 * 7,
    }, {
      subject: "two",
      x: 0, // master
      y: 80 * 6,
    }, {
      subject: "three",
      x: 50, // dev
      y: 80 * 5,
    }, {
      subject: "four",
      x: 0, // master
      y: 80 * 5,
    }, {
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
    }]);
  });
});
