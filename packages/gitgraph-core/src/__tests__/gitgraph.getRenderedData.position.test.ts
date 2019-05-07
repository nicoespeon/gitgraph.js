import { GitgraphCore } from "../gitgraph";
import { Mode } from "../mode";
import { Orientation } from "../orientation";

describe("Gitgraph.getRenderedData.position", () => {
  it("should deal with 3 straight commits", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore({
      orientation: Orientation.VerticalReverse,
    });
    const gitgraph = core.getUserApi();

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore({
      orientation: Orientation.Horizontal,
    });
    const gitgraph = core.getUserApi();

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });
    const gitgraph = core.getUserApi();

    gitgraph
      .commit("one")
      .commit("two")
      .commit("three");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    const feat = gitgraph.branch("feat");
    feat.commit("six");

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = core.getRenderedData();

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

  it("should deal with one branch (with fast-forward merge)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.merge({ branch: dev, fastForward: true });

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0,
        y: 80 * 2,
      },
      {
        subject: "two",
        x: 0,
        y: 80 * 1,
      },
      {
        subject: "three",
        x: 0, // dev, fast-forwarded
        y: 0,
      },
    ]);
  });

  it("should deal with one branch (with impossible fast-forward merge)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");

    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four"); // Prevent fast-forward
    master.merge({ branch: dev, fastForward: true });

    const { commits } = core.getRenderedData();

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
        x: 0, // master
        y: 80 * 1,
      },
      {
        subject: "Merge branch dev",
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should deal with one branch (with merge) (vertical-reverse)", () => {
    const core = new GitgraphCore({
      orientation: Orientation.VerticalReverse,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore({
      orientation: Orientation.Horizontal,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph.branch("master");
    master.commit("one").commit("two");
    const dev = gitgraph.branch("dev");
    dev.commit("three");
    master.commit("four");
    dev.commit("five");
    master.merge(dev);

    const { commits } = core.getRenderedData();

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
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

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

    const { commits } = core.getRenderedData();

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

  it("should deal with the compact mode (simple case)", () => {
    const core = new GitgraphCore({
      mode: Mode.Compact,
      // Orientate the graph from top to bottom to simplify tests.
      orientation: Orientation.VerticalReverse,
    });
    const gitgraph = core.getUserApi();

    const master = gitgraph
      .branch("master")
      .commit("one")
      .commit("two");

    // Branch has more commits.
    const dev = gitgraph.branch("dev").commit("three");
    master.merge(dev);

    // Branch & master have as much commits.
    const feat1 = gitgraph.branch("feat1").commit("four");
    master.commit("five");
    master.merge(feat1);

    // Master has more commits.
    const feat2 = gitgraph.branch("feat2").commit("six");
    master.commit("seven").commit("eight");
    master.merge(feat2);

    const { commits } = core.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        x: 0, // master
        y: 0,
      },
      {
        subject: "two",
        x: 0, // master
        y: 80,
      },
      {
        subject: "three",
        x: 50, // dev
        y: 80 * 2,
      },
      {
        subject: "Merge branch dev",
        x: 0, // master
        y: 80 * 3,
      },
      {
        subject: "four",
        x: 100, // feat1
        y: 80 * 4,
      },
      {
        subject: "five",
        x: 0, // master
        y: 80 * 4,
      },
      {
        subject: "Merge branch feat1",
        x: 0, // master
        y: 80 * 5,
      },
      {
        subject: "six",
        x: 150, // feat2
        y: 80 * 6,
      },
      {
        subject: "seven",
        x: 0, // master
        y: 80 * 6,
      },
      {
        subject: "eight",
        x: 0, // master
        y: 80 * 7,
      },
      {
        subject: "Merge branch feat2",
        x: 0, // master
        y: 80 * 8,
      },
    ]);
  });

  it("should deal with the compact mode (complex case)", () => {
    const core = new GitgraphCore({
      mode: Mode.Compact,
    });
    const gitgraph = core.getUserApi();

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

    const { commits } = core.getRenderedData();

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
