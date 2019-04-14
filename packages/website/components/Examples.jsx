import React from "react";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";

export { BasicUsageResult, BasicScenario };

function BasicUsageResult() {
  return (
    <Gitgraph>
      {(gitgraph) => {
        const master = gitgraph.branch("master");
        master.commit("Init the project");

        master
          .commit("Add README")
          .commit("Add tests")
          .commit("Implement feature");

        master.tag("v1.0");

        const newFeature = gitgraph.branch("new-feature");
        newFeature.commit("Implement an awesome feature");

        master.commit("Hotfix a bug");
        newFeature.commit("Fix tests");

        // Merge `newFeature` into `master`
        master.merge(newFeature, "Release new version");
      }}
    </Gitgraph>
  );
}

function BasicScenario(props) {
  return (
    <Gitgraph
      options={{
        ...props.options,
        template: templateExtend(props.templateName || TemplateName.Metro, {
          commit: {
            message: { displayHash: false, displayAuthor: false },
          },
        }),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("Init the project")
          .commit("Add README")
          .commit("Add tests");

        master.tag("v1.0");

        const newFeature = gitgraph.branch("new-feature");
        newFeature.commit("Implement an awesome feature");

        master.commit("Hotfix a bug");
        newFeature.commit("Fix tests");

        // Merge `newFeature` into `master`
        master.merge(newFeature).tag("v2.0");
      }}
    </Gitgraph>
  );
}
