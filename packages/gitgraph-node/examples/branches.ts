import { gitgraph, render } from "../src";

const master = gitgraph.branch("master");
master.commit("Master - 1st commit");

const feat1 = gitgraph.branch("feat1");
feat1.commit("Feat 1 - 1st commit");

const feat2 = gitgraph.branch("feat2");
feat2.commit("Feat 2 - 1st commit");

master.commit("Master - 2nd commit");
feat1.commit("Feat 1 - 2nd commit");
feat2.commit("Feat 2 - 2nd commit");

master.commit("Master - 3rd commit");
const feat3 = gitgraph.branch("feat3");
feat3.commit("Feat 3 - 1st commit");
feat3.commit("Feat 3 - 2nd commit");

feat1.commit("Feat 1 - 3rd commit");
feat2.commit("Feat 2 - 3rd commit");
feat3.commit("Feat 3 - 3rd commit");

master.merge(feat3);

render();
