import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";

import { createFixedHashGenerator } from "../helpers";

storiesOf("gitgraph-react/5. Templates", module)
  .add("metro", () => (
    <Gitgraph
      options={{
        template: TemplateName.Metro,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");
        const develop = gitgraph.branch("develop").commit("four");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("blackArrow", () => (
    <Gitgraph
      options={{
        template: TemplateName.BlackArrow,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");

        const develop = gitgraph.branch("develop").commit("four");
        master.commit("five").tag("important");
        master.merge(develop);

        const feat1 = gitgraph.branch("feat1");
        master.commit().tag("v1");
        feat1.commit();
      }}
    </Gitgraph>
  ))
  .add("blackArrow with reverse arrow", () => (
    <Gitgraph
      options={{
        template: TemplateName.BlackArrow,
        reverseArrow: true,
        generateCommitHash: createFixedHashGenerator(),
      }}
    >
      {(gitgraph) => {
        const master = gitgraph
          .branch("master")
          .commit("one")
          .commit("two")
          .commit("three");
        const develop = gitgraph.branch("develop").commit("four");
        master.commit("five");
        master.merge(develop);
      }}
    </Gitgraph>
  ))
  .add("without commit hash", () => {
    const withoutHash = templateExtend(TemplateName.Metro, {
      commit: {
        message: {
          displayHash: false,
        },
      },
    });

    return (
      <Gitgraph
        options={{
          template: withoutHash,
          generateCommitHash: createFixedHashGenerator(),
        }}
      >
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .commit("two")
            .commit("three");
        }}
      </Gitgraph>
    );
  })
  .add("without commit author", () => {
    const withoutAuthor = templateExtend(TemplateName.Metro, {
      commit: {
        message: {
          displayAuthor: false,
        },
      },
    });

    return (
      <Gitgraph
        options={{
          template: withoutAuthor,
          generateCommitHash: createFixedHashGenerator(),
        }}
      >
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .commit("two")
            .commit("three");
        }}
      </Gitgraph>
    );
  })
  .add("without branch label", () => {
    const withoutBranchLabel = templateExtend(TemplateName.Metro, {
      branch: {
        label: {
          display: false,
        },
      },
    });

    return (
      <Gitgraph
        options={{
          template: withoutBranchLabel,
          generateCommitHash: createFixedHashGenerator(),
        }}
      >
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .commit("two")
            .commit("three");
        }}
      </Gitgraph>
    );
  })
  .add("with custom branch labels", () => {
    const customBranchLabels = templateExtend(TemplateName.Metro, {
      branch: {
        label: {
          bgColor: "#ffce52",
          color: "black",
          strokeColor: "#ce9b00",
          borderRadius: 0,
          font: "italic 12pt serif",
        },
      },
    });

    return (
      <Gitgraph
        options={{
          template: customBranchLabels,
          generateCommitHash: createFixedHashGenerator(),
        }}
      >
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .commit("two")
            .commit("three");
        }}
      </Gitgraph>
    );
  })
  .add("with custom tags", () => {
    const customTags = templateExtend(TemplateName.Metro, {
      tag: {
        color: "black",
        strokeColor: "#ce9b00",
        bgColor: "#ffce52",
        font: "italic 12pt serif",
        borderRadius: 0,
        pointerWidth: 6,
      },
    });

    return (
      <Gitgraph
        options={{
          template: customTags,
          generateCommitHash: createFixedHashGenerator(),
        }}
      >
        {(gitgraph) => {
          gitgraph
            .commit("one")
            .tag("v1")
            .commit("two")
            .tag("v2")
            .tag("important")
            .commit("three");
        }}
      </Gitgraph>
    );
  });
