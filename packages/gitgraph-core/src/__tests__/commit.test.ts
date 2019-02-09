import { Commit } from "../commit";
import { blackArrowTemplate } from "../template";

describe("Commit", () => {
  it("should not mutate given style", () => {
    const style = blackArrowTemplate.commit;
    const commit = new Commit({
      author: "",
      subject: "",
      style,
    });

    const newCommit = commit.withDefaultColor("green");

    expect(newCommit.style.dot.color).toBe("green");
    expect(commit.style.dot.color).not.toBe("green");
    expect(style.dot.color).not.toBe("green");
  });
});
