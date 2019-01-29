import { GitgraphCore } from "../gitgraph";
import { Template } from "../template";

describe("Gitgraph.getRenderedData.commitMessagesX", () => {
  const template = new Template({
    branch: {
      spacing: 10,
    },
  });

  it("should set commitMessagesX to 0 when graph is initialized", () => {
    const core = new GitgraphCore({ template });

    const { commitMessagesX } = core.getRenderedData();

    expect(commitMessagesX).toBe(0);
  });

  it("should set commitMessagesX to width of graph when there is one branch", () => {
    const core = new GitgraphCore({ template });
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit();

    const { commitMessagesX } = core.getRenderedData();

    expect(commitMessagesX).toBe(10);
  });

  it("should set commitMessagesX to width of graph when there are two branches", () => {
    const core = new GitgraphCore({ template });
    const gitgraph = core.getUserApi();

    gitgraph.branch("master").commit();
    gitgraph.branch("dev").commit();

    const { commitMessagesX } = core.getRenderedData();

    expect(commitMessagesX).toBe(20);
  });
});
