import { GitgraphCore } from "../gitgraph";
import { Layout } from "../layout";

describe("Gitgraph Layout", () => {
  it("should tell it's default layout if not set", () => {
    const gitgraph = new GitgraphCore();

    expect(gitgraph.getLayout).toBe(Layout.Default);
  });

  it("should not re-use any columns for default layout", () => {
    const core = new GitgraphCore({
      layout: Layout.Default,
    });
  });

  it("should not recognize the Gitamine layout is set", () => {
    const core = new GitgraphCore({
      layout: Layout.Gitamine,
    });
  });
});
