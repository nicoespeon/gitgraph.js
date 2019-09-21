import { GitgraphCore } from "../gitgraph";
import { Layout } from "../layout";

describe("Gitgraph Layout", () => {
  it("should tell it's regular by default", () => {
    const gitgraph = new GitgraphCore();

    expect(gitgraph.getLayout).toBe(Layout.Regular);
  });

  it("should not re-use any columns for regular layout", () => {
    const core = new GitgraphCore({
      layout: Layout.Regular,
    });
  });

  it("should re-use closed branches columns for compact layout", () => {
    const core = new GitgraphCore({
      layout: Layout.Compact,
    });
  });

  it("should re-use all columns for compact layout", () => {
    const core = new GitgraphCore({
      layout: Layout.Condensed,
    });
  });
});
