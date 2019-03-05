import { GitgraphCore } from "../gitgraph";
import { Orientation } from "../orientation";

describe("Gitgraph Orientation", () => {
  it("should tell it's vertical by default", () => {
    const gitgraph = new GitgraphCore();

    expect(gitgraph.isVertical).toBe(true);
    expect(gitgraph.isHorizontal).toBe(false);
  });

  it("should tell it's vertical in VerticalReverse orientation", () => {
    const gitgraph = new GitgraphCore({
      orientation: Orientation.VerticalReverse,
    });

    expect(gitgraph.isVertical).toBe(true);
    expect(gitgraph.isHorizontal).toBe(false);
  });

  it("should tell it's horizontal in Horizontal orientation", () => {
    const gitgraph = new GitgraphCore({
      orientation: Orientation.Horizontal,
    });

    expect(gitgraph.isVertical).toBe(false);
    expect(gitgraph.isHorizontal).toBe(true);
  });

  it("should tell it's horizontal in HorizontalReverse orientation", () => {
    const gitgraph = new GitgraphCore({
      orientation: Orientation.HorizontalReverse,
    });

    expect(gitgraph.isVertical).toBe(false);
    expect(gitgraph.isHorizontal).toBe(true);
  });
});
