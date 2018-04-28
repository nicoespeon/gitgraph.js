import "jest";
import { GitgraphCore, TemplateEnum, metroTemplate } from "../index";

describe("Gitgraph.constructor", () => {
  it("should have the correct default options", () => {
    const gitgraph = new GitgraphCore();

    expect(gitgraph).toMatchObject({
      author: "Sergio Flores <saxo-guy@epic.com>",
      initCommitOffsetX: 0,
      initCommitOffsetY: 0,
      reverseArrow: false,
    });
  });

  it("should be able to override options", () => {
    const gitgraph = new GitgraphCore({
      author: "Fabien BERNARD <fabien0102@gmail.com>",
      reverseArrow: true,
      template: TemplateEnum.Metro,
    });

    expect(gitgraph).toMatchObject({
      author: "Fabien BERNARD <fabien0102@gmail.com>",
      initCommitOffsetX: 0,
      initCommitOffsetY: 0,
      reverseArrow: true,
      template: metroTemplate,
    });
  });
});
