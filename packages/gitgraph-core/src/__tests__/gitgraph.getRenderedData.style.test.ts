import {
  GitgraphCore,
  GitgraphCommitOptions,
  BranchOptions,
  metroTemplate,
  Orientation,
  Mode,
  TemplateName,
  blackArrowTemplate,
} from "../index";

describe("Gitgraph.getRenderedData.style", () => {
  it("should have the style of the template by default", () => {
    const gitgraph = new GitgraphCore();
    gitgraph.commit();

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    expect(commit.style).toEqual(createExpectedStyle());
  });

  it("should have a merge style with the defaultCommitOptions", () => {
    const gitgraph = new GitgraphCore();
    gitgraph
      .branch({
        commitDefaultOptions: { style: { message: { color: "green" } } },
      } as BranchOptions)
      .commit();

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    const expectedStyle = createExpectedStyle();
    expectedStyle.message.color = "green";
    expect(commit.style).toEqual(expectedStyle);
  });

  it("should have a merge style with the commit", () => {
    const gitgraph = new GitgraphCore();
    gitgraph
      .branch({
        commitDefaultOptions: { style: { message: { color: "green" } } },
      } as BranchOptions)
      .commit({
        style: { message: { display: false } },
      } as GitgraphCommitOptions);

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    const expectedStyle = createExpectedStyle();
    expectedStyle.message.color = "green";
    expectedStyle.message.display = false;
    expect(commit.style).toEqual(expectedStyle);
  });

  it("should have the color depending of the branch (metro theme)", () => {
    const gitgraph = new GitgraphCore();
    gitgraph.branch("master").commit("one");
    gitgraph.branch("dev").commit("two");
    gitgraph.branch("feat1").commit("three");
    gitgraph.branch("feat2").commit("four");
    gitgraph.branch("feat3").commit("five");

    const { colors } = metroTemplate;
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        style: {
          color: colors[0],
          message: { color: colors[0] },
          dot: { color: colors[0] },
        },
      },
      {
        subject: "two",
        style: {
          color: colors[1],
          message: { color: colors[1] },
          dot: { color: colors[1] },
        },
      },
      {
        subject: "three",
        style: {
          color: colors[2],
          message: { color: colors[2] },
          dot: { color: colors[2] },
        },
      },
      {
        subject: "four",
        style: {
          color: colors[0],
          message: { color: colors[0] },
          dot: { color: colors[0] },
        },
      },
      {
        subject: "five",
        style: {
          color: colors[1],
          message: { color: colors[1] },
          dot: { color: colors[1] },
        },
      },
    ]);
  });

  it("should have the color depending of the branch (blackarrow theme)", () => {
    const gitgraph = new GitgraphCore({
      template: TemplateName.BlackArrow,
    });
    gitgraph.branch("master").commit("one");
    gitgraph.branch("dev").commit("two");
    gitgraph.branch("feat1").commit("three");
    gitgraph.branch("feat2").commit("four");
    gitgraph.branch("feat3").commit("five");
    gitgraph.branch("feat4").commit("six");

    const { colors } = blackArrowTemplate;
    const { commits } = gitgraph.getRenderedData();

    expect(commits).toMatchObject([
      {
        subject: "one",
        style: {
          color: colors[0],
          dot: { color: colors[0] },
        },
      },
      {
        subject: "two",
        style: {
          color: colors[1],
          dot: { color: colors[1] },
        },
      },
      {
        subject: "three",
        style: {
          color: colors[2],
          dot: { color: colors[2] },
        },
      },
      {
        subject: "four",
        style: {
          color: colors[3],
          dot: { color: colors[3] },
        },
      },
      {
        subject: "five",
        style: {
          color: colors[4],
          dot: { color: colors[4] },
        },
      },
      {
        subject: "six",
        style: {
          color: colors[0],
          dot: { color: colors[0] },
        },
      },
    ]);
  });

  it("should hide commit message if orientation is horizontal", () => {
    const gitgraph = new GitgraphCore({
      orientation: Orientation.Horizontal,
    });
    gitgraph.commit();

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  it("should hide commit message if orientation is horizontal-reverse", () => {
    const gitgraph = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });
    gitgraph.commit();

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  it("should hide commit message if mode is compact", () => {
    const gitgraph = new GitgraphCore({
      mode: Mode.Compact,
    });
    gitgraph.commit();

    const { commits } = gitgraph.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });
});

function createExpectedStyle() {
  return {
    color: "#979797",
    dot: {
      color: "#979797",
      size: 14,
      strokeWidth: 0,
      font: "normal 14pt Arial",
    },
    message: {
      color: "#979797",
      display: true,
      displayAuthor: true,
      displayBranch: true,
      displayHash: true,
      font: "normal 14pt Arial",
    },
    shouldDisplayTooltipsInCompactMode: true,
    spacing: 80,
  };
}
