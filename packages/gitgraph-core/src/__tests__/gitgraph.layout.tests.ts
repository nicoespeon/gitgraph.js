import { GitgraphCore } from "../gitgraph";
import { Layout } from "../layout";

describe("Gitgraph Layout", () => {
  it("should tell it's regular by default", () => {
    const gitgraph = new GitgraphCore();

    expect(gitgraph.getLayout).toBe(Layout.Regular);
  });
});
