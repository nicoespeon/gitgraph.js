import Commit from "../commit";
import { blackArrowTemplate } from "../template";

describe("Commit", () => {
  it("should not mutate given style", () => {
    const style = blackArrowTemplate.commit;
    const commit = new Commit({
      author: "",
      subject: "",
      style,
    });

    commit.setDefaultColor("green");

    expect(commit.style.dot.color).toBe("green");
    expect(style.dot.color).not.toBe("green");
  });
});
