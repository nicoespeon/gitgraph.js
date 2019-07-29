import { GitgraphCore } from "../gitgraph";
import { Mode } from "../mode";
import { BranchOptions } from "../branch";
import {
  metroTemplate,
  TemplateName,
  blackArrowTemplate,
  templateExtend,
} from "../template";
import { Orientation } from "../orientation";

describe("Gitgraph.getRenderedData.style", () => {
  it("should have the style of the template by default", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.commit();

    const { commits } = core.getRenderedData();
    const [commit] = commits;

    expect(commit.style).toEqual(createExpectedStyle());
  });

  it("should have a merge style with the defaultCommitOptions", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .branch({
        commitDefaultOptions: { style: { message: { color: "green" } } },
      } as BranchOptions)
      .commit();

    const { commits } = core.getRenderedData();
    const expectedStyle = createExpectedStyle();
    expectedStyle.message.color = "green";
    expect(commits[0].style).toEqual(expectedStyle);
  });

  it("should have a merge style with the commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph
      .branch({
        commitDefaultOptions: { style: { message: { color: "green" } } },
      } as BranchOptions)
      .commit({
        style: { message: { display: false } },
      });

    const { commits } = core.getRenderedData();
    const expectedStyle = createExpectedStyle();
    expectedStyle.message.color = "green";
    expectedStyle.message.display = false;
    expect(commits[0].style).toEqual(expectedStyle);
  });

  it("should have the color depending of the branch (metro theme)", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit("one");
    gitgraph.branch("dev").commit("two");
    gitgraph.branch("feat1").commit("three");
    gitgraph.branch("feat2").commit("four");
    gitgraph.branch("feat3").commit("five");

    const { colors } = metroTemplate;
    const { commits } = core.getRenderedData();
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
    const core = new GitgraphCore({
      template: TemplateName.BlackArrow,
    });
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit("one");
    gitgraph.branch("dev").commit("two");
    gitgraph.branch("feat1").commit("three");
    gitgraph.branch("feat2").commit("four");
    gitgraph.branch("feat3").commit("five");
    gitgraph.branch("feat4").commit("six");

    const { colors } = blackArrowTemplate;
    const { commits } = core.getRenderedData();
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
    const core = new GitgraphCore({
      orientation: Orientation.Horizontal,
    });
    const gitgraph = core.getUserApi();

    gitgraph.commit();

    const { commits } = core.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  it("should hide commit message if orientation is horizontal-reverse", () => {
    const core = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });
    const gitgraph = core.getUserApi();

    gitgraph.commit();

    const { commits } = core.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  it("should hide message if so specified in template", () => {
    const template = templateExtend(TemplateName.Metro, {
      commit: {
        message: {
          display: false,
        },
      },
    });

    const core = new GitgraphCore({ template });
    const gitgraph = core.getUserApi();

    gitgraph.commit();

    const { commits } = core.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  it("should hide commit message if mode is compact", () => {
    const core = new GitgraphCore({
      mode: Mode.Compact,
    });
    const gitgraph = core.getUserApi();

    gitgraph.commit();

    const { commits } = core.getRenderedData();
    const [commit] = commits;

    expect(commit.style.message.display).toBe(false);
  });

  describe("merge with fast-forward", () => {
    it("should have the same color for all commits after fast-forward", () => {
      const { colors } = metroTemplate;
      const core = new GitgraphCore({
        template: TemplateName.Metro,
      });
      const gitgraph = core.getUserApi();

      const master = gitgraph.branch("master");
      master.commit("one");

      const develop = gitgraph.branch("develop");
      develop.commit("two").commit("three");

      // Trigger `getRenderedData()` before merge to test for side-effects.
      core.getRenderedData();
      master.merge({ branch: develop, fastForward: true });

      const { commits } = core.getRenderedData();

      const expectedStyle = {
        color: colors[0],
        dot: { color: colors[0] },
        message: { color: colors[0] },
      };
      expect(commits).toMatchObject([
        {
          subject: "one",
          style: expectedStyle,
        },
        {
          subject: "two",
          style: expectedStyle,
        },
        {
          subject: "three",
          style: expectedStyle,
        },
      ]);
    });

    it("should have the correct color for branches after fast-forward", () => {
      const { colors } = metroTemplate;
      const core = new GitgraphCore({
        template: TemplateName.Metro,
      });
      const gitgraph = core.getUserApi();

      const master = gitgraph.branch("master");
      master.commit();

      const feat1 = gitgraph.branch("feat1");
      feat1.commit();

      // Trigger `getRenderedData()` before merge to test for side-effects.
      core.getRenderedData();
      master.merge({ branch: feat1, fastForward: true });

      const feat2 = gitgraph.branch("feat2");
      feat2.commit("New branch");

      const { commits } = core.getRenderedData();

      const feat2Commit = commits[commits.length - 1];
      expect(feat2Commit.subject).toBe("New branch");
      expect(feat2Commit.style.color).toBe(colors[1]);
      expect(feat2Commit.style.dot.color).toBe(colors[1]);
      expect(feat2Commit.style.message.color).toBe(colors[1]);
    });
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
      displayHash: true,
      font: "normal 14pt Arial",
    },
    hasTooltipInCompactMode: true,
    spacing: 80,
  };
}
