const master = gitgraph.branch("master");
master.commit("Init the project");

master
  .commit("Init the project")
  .commit("Add README")
  .commit("Add tests");

master.tag("v1.0");

const newFeature = gitgraph.branch("new-feature");
newFeature.commit("Implement an awesome feature");

master.commit("Hotfix a bug");
newFeature.commit("Fix tests");

// Merge `newFeature` into `master`
master.merge(newFeature);
