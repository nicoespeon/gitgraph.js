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

  it("should compute message from commit information", () => {
    const commit = new Commit({
      author: "Nicolas Carlo <nicolas.carlo@gmail.com>",
      hash: "1234567890",
      subject: "A new commit",
      style: blackArrowTemplate.commit,
    });

    expect(commit.message).toBe(
      "1234567 A new commit - Nicolas Carlo <nicolas.carlo@gmail.com>",
    );
  });

  it("should not include commit hash in message if configured in style", () => {
    const commit = new Commit({
      author: "Nicolas Carlo <nicolas.carlo@gmail.com>",
      hash: "1234567890",
      subject: "A new commit",
      style: {
        ...blackArrowTemplate.commit,
        message: { ...blackArrowTemplate.commit.message, displayHash: false },
      },
    });

    expect(commit.message).toBe(
      "A new commit - Nicolas Carlo <nicolas.carlo@gmail.com>",
    );
  });

  it("should not include commit author in message if configured in style", () => {
    const commit = new Commit({
      author: "Nicolas Carlo <nicolas.carlo@gmail.com>",
      hash: "1234567890",
      subject: "A new commit",
      style: {
        ...blackArrowTemplate.commit,
        message: { ...blackArrowTemplate.commit.message, displayAuthor: false },
      },
    });

    expect(commit.message).toBe("1234567 A new commit");
  });
});
