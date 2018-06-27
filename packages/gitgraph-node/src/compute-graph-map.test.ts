import { GitgraphCore, Branch } from "gitgraph-core/lib";

import computeGraphMap, { GraphCommit } from "./compute-graph-map";

let gitgraph: GitgraphCore;
let master: Branch;

beforeEach(() => {
  gitgraph = new GitgraphCore();
  master = gitgraph.branch("master");
});

it("should log graph for a single commit on a single branch", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });

  const graphMap = computeGraphMap(gitgraph);

  const graphCommit: GraphCommit = {
    hash: "9a58c0b",
    message: "Hello",
    refs: ["master", "HEAD"]
  };
  expect(graphMap).toEqual([
    ["*", graphCommit]
  ]);
});

it("should log graph for multiple commits on a single branch", () => {
  master.commit({
    hash: "9a58c0b5939a20a929bf3ade9b2974e91106a83f",
    subject: "Hello"
  });
  master.commit({
    hash: "8b4581ad6fc5ceca3726e585c2a46a76a4cd3a23",
    subject: "World!"
  });

  const graphMap = computeGraphMap(gitgraph);

  const graphCommit1: GraphCommit = {
    hash: "9a58c0b",
    message: "Hello",
    refs: []
  };
  const graphCommit2: GraphCommit = {
    hash: "8b4581a",
    message: "World!",
    refs: ["master", "HEAD"]
  };
  expect(graphMap).toEqual([
    ["*", graphCommit1],
    ["*", graphCommit2]
  ]);
});

it("should log graph for multiple commits on 2 branches (fast-forward)", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");

  const graphMap = computeGraphMap(gitgraph);

  const masterGraphCommit = expect.objectContaining({
    message: "one",
    refs: ["master"]
  });
  const developGraphCommit = expect.objectContaining({
    message: "two",
    refs: ["develop", "HEAD"]
  });
  expect(graphMap).toEqual([
    ["*", " ", " ", masterGraphCommit],
    [" ", "\\", " ", " "],
    [" ", " ", "*", developGraphCommit]
  ]);
});

it("should log graph for multiple commits on 2 branches (no fast-forward)", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");
  master.commit("three");
  develop.commit("four");

  const graphMap = computeGraphMap(gitgraph);

  const graphCommit1 = expect.objectContaining({
    message: "one",
    refs: []
  });
  const graphCommit2 = expect.objectContaining({
    message: "two",
    refs: []
  });
  const graphCommit3 = expect.objectContaining({
    message: "three",
    refs: ["master"]
  });
  const graphCommit4 = expect.objectContaining({
    message: "four",
    refs: ["develop", "HEAD"]
  });
  expect(graphMap).toEqual([
    ["*", " ", " ", graphCommit1],
    ["|", "\\", " ", " "],
    ["|", " ", "*", graphCommit2],
    ["*", " ", "|", graphCommit3],
    [" ", " ", "*", graphCommit4],
  ]);
});

it("should log graph for 2 branches with merge", () => {
  master.commit("one");
  const develop = gitgraph.branch("develop");
  develop.commit("two");
  master.merge(develop);

  const graphMap = computeGraphMap(gitgraph);

  const masterGraphCommit = expect.objectContaining({
    message: "one",
    refs: []
  });
  const developGraphCommit = expect.objectContaining({
    message: "two",
    refs: ["develop"]
  });
  const mergeCommit = expect.objectContaining({
    refs: ["master", "HEAD"]
  });
  expect(graphMap).toEqual([
    ["*", " ", " ", masterGraphCommit],
    ["|", "\\", " ", " "],
    ["|", " ", "*", developGraphCommit],
    ["|", "/", " ", " "],
    ["*", " ", " ", mergeCommit],
  ]);
});

it("should log graph for 3 branches (consecutive)", () => {
  master.commit("one");

  const feat1 = gitgraph.branch("feat1");
  feat1.commit("two");

  const feat2 = gitgraph.branch("feat2");
  feat2.commit("three");

  const graphMap = computeGraphMap(gitgraph);

  const masterCommit = expect.objectContaining({
    message: "one",
    refs: ["master"]
  });
  const feat1Commit = expect.objectContaining({
    message: "two",
    refs: ["feat1"]
  });
  const feat2Commit = expect.objectContaining({
    message: "three",
    refs: ["feat2", "HEAD"]
  });
  expect(graphMap).toEqual([
    ["*", " ", " ", " ", " ", masterCommit],
    [" ", "\\", " ", " ", " ", " "],
    [" ", " ", "*", " ", " ", feat1Commit],
    [" ", " ", " ", "\\", " ", " "],
    [" ", " ", " ", " ", "*", feat2Commit],
  ]);
});

it("should log graph for 3 branches (from master)", () => {
  master.commit("one");

  const feat1 = gitgraph.branch("feat1");
  feat1.commit("two");

  // Reset HEAD to master
  master.commit("three");

  const feat2 = gitgraph.branch("feat2");
  feat2.commit("four");

  const graphMap = computeGraphMap(gitgraph);

  const masterCommit1 = expect.objectContaining({
    message: "one",
    refs: []
  });
  const feat1Commit = expect.objectContaining({
    message: "two",
    refs: ["feat1"]
  });
  const masterCommit2 = expect.objectContaining({
    message: "three",
    refs: ["master"]
  });
  const feat2Commit = expect.objectContaining({
    message: "four",
    refs: ["feat2", "HEAD"]
  });
  expect(graphMap).toEqual([
    ["*", " ", " ", " ", " ", masterCommit1],
    ["|", "\\", " ", " ", " ", " "],
    ["|", " ", "*", " ", " ", feat1Commit],
    ["*", " ", " ", " ", " ", masterCommit2],
    [" ", "\\", " ", " ", " ", " "],
    [" ", " ", "\\", " ", " ", " "],
    [" ", " ", " ", "\\", " ", " "],
    [" ", " ", " ", " ", "*", feat2Commit],
  ]);
});
