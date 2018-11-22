import { GitgraphCore } from "../gitgraph";
import { Template } from "../template";

describe("Gitgraph.getRenderedData.commitMessagesX", () => {
  let gitgraph: GitgraphCore;

  const template = new Template({
    branch: {
      spacing: 10,
    },
  });

  beforeEach(() => {
    gitgraph = new GitgraphCore({ template });
  });

  it("should set commitMessagesX to 0 when graph is initialized", () => {
    const { commitMessagesX } = gitgraph.getRenderedData();

    expect(commitMessagesX).toBe(0);
  });

  it("should set commitMessagesX to width of graph when there is one branch", () => {
    gitgraph.branch("master").commit();

    const { commitMessagesX } = gitgraph.getRenderedData();

    expect(commitMessagesX).toBe(10);
  });

  it("should set commitMessagesX to width of graph when there are two branches", () => {
    gitgraph.branch("master").commit();
    gitgraph.branch("dev").commit();

    const { commitMessagesX } = gitgraph.getRenderedData();

    expect(commitMessagesX).toBe(20);
  });
});
