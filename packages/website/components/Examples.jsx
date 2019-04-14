import React from "react";
import { Gitgraph, templateExtend, TemplateName, Mode } from "@gitgraph/react";

export { BasicScenario };

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
