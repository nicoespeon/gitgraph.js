import { GitgraphCore } from "../gitgraph";

describe("Gitgraph.subscribe", () => {
  it("should call onUpdate on each commit", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const onUpdate = jest.fn();
    core.subscribe(onUpdate);

    gitgraph
      .commit()
      .commit()
      .commit();

    expect(onUpdate.mock.calls.length).toBe(3);
  });

  it("should call render on merge", () => {
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const onUpdate = jest.fn();
    core.subscribe(onUpdate);

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
    const core = new GitgraphCore();
    const gitgraph = core.getUserApi();

    const onUpdate = jest.fn();
    const unsubscribe = core.subscribe(onUpdate);

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
