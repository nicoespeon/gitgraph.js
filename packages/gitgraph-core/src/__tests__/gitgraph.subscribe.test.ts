import { GitgraphCore } from "../index";

describe("Gitgraph.subscribe", () => {
  let gitgraph: GitgraphCore;

  beforeEach(() => {
    gitgraph = new GitgraphCore();
  });

  it("should call onUpdate method on next", () => {
    const onUpdate = jest.fn();
    gitgraph.subscribe(onUpdate);
    gitgraph.next();
    expect(onUpdate.mock.calls.length).toBe(1);
  });

  it("should call onUpdate on each commit", () => {
    const onUpdate = jest.fn();
    gitgraph.subscribe(onUpdate);

    gitgraph
      .commit()
      .commit()
      .commit();

    expect(onUpdate.mock.calls.length).toBe(3);
  });

  it("should call render on merge", () => {
    const onUpdate = jest.fn();
    gitgraph.subscribe(onUpdate);

    const master = gitgraph
      .branch("master")
      .commit()
      .commit()
      .commit();
    const dev = gitgraph
      .branch("dev")
      .commit()
      .commit();
    master.merge(dev);

    expect(onUpdate.mock.calls.length).toBe(6);
  });

  it("should be able to unsubscribe", () => {
    const onUpdate = jest.fn();
    const unsubscribe = gitgraph.subscribe(onUpdate);

    const master = gitgraph
      .branch("master")
      .commit()
      .commit()
      .commit();

    unsubscribe();
    const dev = gitgraph
      .branch("dev")
      .commit()
      .commit();
    master.merge(dev);

    expect(onUpdate.mock.calls.length).toBe(3);
  });
});
