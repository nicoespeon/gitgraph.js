import "jest";
import { GitGraph, TemplateEnum } from "../gitgraph";

describe("GitGraph", () => {
  describe("constructor", () => {
    it("should have the correct default options", () => {
      const gitgraph: GitGraph = new GitGraph();

      expect(gitgraph.options.author).toBe("Sergio Flores <saxo-guy@epic.com>");
      expect(gitgraph.options.initCommitOffsetX).toBe(0);
      expect(gitgraph.options.initCommitOffsetY).toBe(0);
      expect(gitgraph.options.reverseArrow).toBeFalsy();
    });

    it("should be able to override options", () => {
      const gitgraph: GitGraph = new GitGraph({
        author: "Fabien BERNARD <fabien0102@gmail.com>",
        reverseArrow: true,
        template: TemplateEnum.Metro,
      });

      expect(gitgraph.options.author).toBe("Fabien BERNARD <fabien0102@gmail.com>");
      expect(gitgraph.options.initCommitOffsetX).toBe(0);
      expect(gitgraph.options.initCommitOffsetY).toBe(0);
      expect(gitgraph.options.reverseArrow).toBeTruthy();
      expect(gitgraph.options.template).toBe("metro");
    });
  });
});
