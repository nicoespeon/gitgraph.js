import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  createGitgraph,
  CommitOptions,
  BranchOptions,
  TagOptions,
  Mode,
  Orientation,
  TemplateName,
  templateExtend,
} from "@gitgraph/js";

import {
  GraphContainer,
  createFixedHashGenerator,
  createSvg,
  createG,
  createPath,
  createText,
  createForeignObject,
} from "../helpers";

const withoutBranchLabels = templateExtend(TemplateName.Metro, {
  branch: { label: { display: false } },
});

const renderSax: CommitOptions["renderDot"] = (commit) =>
  createSvg({
    height: 30,
    width: 30,
    viewBox: "0 0 71.84 75.33",
    children: [
      createG({
        fill: commit.style.dot.color || "",
        stroke: "white",
        strokeWidth: 2,
        children: [
          createPath({
            d:
              "M68.91,35.38c4.08-1.15,3.81-3-.22-3.75-3.1-.7-18.24-5.75-20.71-6.74-2.15-1-4.67-.12-1,3.4,4,3.53,1.36,8.13,2.79,13.47C50.6,44.89,52.06,49,56,55.62c2.09,3.48,1.39,6.58-1.42,6.82-1.25.28-3.39-1.33-3.33-3.82h0L44.68,43.79c1.79-1.1,2.68-3,2-4.65s-2.5-2.29-4.46-1.93l-1.92-4.36a3.79,3.79,0,0,0,1.59-4.34c-.62-1.53-2.44-2.27-4.37-2L36,22.91c1.65-1.12,2.46-3,1.83-4.52a3.85,3.85,0,0,0-4.37-1.95c-.76-1.68-2.95-6.89-4.89-10.73C26.45,1.3,20.61-2,16.47,1.36c-5.09,4.24-1.46,9-6.86,12.92l2.05,5.35a18.58,18.58,0,0,0,2.54-2.12c1.93-2.14,3.28-6.46,3.28-6.46s1-4,2.2-.57c1.48,3.15,16.59,47.14,16.59,47.14a1,1,0,0,0,0,.11c.37,1.48,5.13,19,19.78,17.52,4.38-.52,6-1.1,9.14-3.83,3.49-2.71,5.75-6.08,5.91-12.62.12-4.67-6.22-12.62-5.81-17S66.71,36,68.91,35.38Z",
          }),
          createPath({
            d:
              "M2.25,14.53A28.46,28.46,0,0,1,0,17.28s3,4.75,9.58,3a47.72,47.72,0,0,0-1.43-5A10.94,10.94,0,0,1,2.25,14.53Z",
          }),
        ],
      }),
    ],
  });

const renderLongMessage: CommitOptions["renderMessage"] = (commit) => {
  return createG({
    translate: { x: 0, y: commit.style.dot.size },
    children: [
      createText({
        fill: commit.style.dot.color,
        content: `${commit.hashAbbrev} - ${commit.subject}`,
      }),
      createForeignObject({
        width: 600,
        translate: { x: 10, y: 0 },
        content: `
          My money's in that office, right? If she start giving me some
          bullshit about it ain't there, and we got to go someplace else and
          get it, I'm gonna shoot you in the head then and there. Then I'm
          gonna shoot that bitch in the kneecaps, find out where my goddamn
          money is. She gonna tell me too. Hey, look at me when I'm talking
          to you, motherfucker. You listen: we go in there, and that nigga
          Winston or anybody else is in there, you the first motherfucker to
          get shot. You understand?
      `,
      }),
    ],
  });
};

storiesOf("gitgraph-js/6. Custom renders", module)
  .add("with render dot", () => (
    <GraphContainer>
      {(graphContainer) => {
        const renderDot: CommitOptions["renderDot"] = (commit) =>
          renderSax(commit);

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        gitgraph
          .commit({ subject: "Initial commit" })
          .commit({ subject: "Another commit" })
          .commit({
            subject: "Do something crazy",
            renderDot,
          });

        gitgraph
          .branch("dev")
          .commit({
            subject: "Oh my god",
            renderDot,
          })
          .commit({
            subject: "This is a saxo!",
            renderDot,
          });
      }}
    </GraphContainer>
  ))
  .add("with render tooltip", () => (
    <GraphContainer>
      {(graphContainer) => {
        const renderTooltip: CommitOptions["renderTooltip"] = (commit) => {
          const commitSize = commit.style.dot.size * 2;

          return createG({
            translate: { x: commitSize + 10, y: commitSize / 2 },
            children: [
              renderSax(commit),
              createText({
                translate: { x: 40, y: 15 },
                fill: commit.style.dot.color,
                content: `${commit.hashAbbrev} - ${commit.subject}`,
              }),
            ],
          });
        };

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          mode: Mode.Compact,
          template: withoutBranchLabels,
        });

        gitgraph
          .commit({ subject: "Initial commit" })
          .commit({ subject: "Another commit" })
          .commit({
            subject: "Do something crazy",
            renderTooltip,
          });

        gitgraph
          .branch("dev")
          .commit({
            subject: "Oh my god",
            renderTooltip,
          })
          .commit({
            subject: "This is a saxo!",
            renderTooltip,
          });
      }}
    </GraphContainer>
  ))
  .add("with render message", () => (
    <GraphContainer>
      {(graphContainer) => {
        const renderMessage: CommitOptions["renderMessage"] = (commit) => {
          return createText({
            translate: { x: 0, y: commit.style.dot.size },
            fill: commit.style.dot.color,
            content: `${commit.hashAbbrev} - ${commit.subject}`,
          });
        };

        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        gitgraph
          .commit({ subject: "Initial commit" })
          .commit({ subject: "Another commit" })
          .commit({
            subject: "Do something crazy",
            renderMessage,
          });

        gitgraph
          .branch("dev")
          .commit({
            subject: "Oh my god",
            renderMessage,
          })
          .commit({
            subject: "This is a saxo!",
            renderMessage,
          });
      }}
    </GraphContainer>
  ))
  .add("with render message (long)", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
        });

        gitgraph
          .commit({ subject: "Initial commit" })
          .commit({ subject: "Another commit" })
          .commit({
            subject: "Do something crazy",
            renderMessage: renderLongMessage,
          });

        gitgraph
          .branch("dev")
          .commit({
            subject: "Oh my god",
          })
          .commit({
            subject: "This is a saxo!",
          });
      }}
    </GraphContainer>
  ))
  .add("with render message (long & reverse orientation)", () => (
    <GraphContainer>
      {(graphContainer) => {
        const gitgraph = createGitgraph(graphContainer, {
          generateCommitHash: createFixedHashGenerator(),
          orientation: Orientation.VerticalReverse,
        });

        gitgraph
          .commit({ subject: "Initial commit" })
          .commit({ subject: "Another commit" })
          .commit({
            subject: "Do something crazy",
            renderMessage: renderLongMessage,
          });

        gitgraph
          .branch("dev")
          .commit({
            subject: "Oh my god",
          })
          .commit({
            subject: "This is a saxo!",
          });
      }}
    </GraphContainer>
  ))
  .add("with render branch label", () => {
    const renderLabel: BranchOptions["renderLabel"] = (branch) => {
      return createText({
        content: `🎷 ${branch.name}`,
        fill: branch.style.label.color,
        font: branch.style.label.font,
        translate: {
          x: 0,
          y: 20,
        },
        rotate: -15,
      });
    };

    return (
      <GraphContainer>
        {(graphContainer) => {
          const gitgraph = createGitgraph(graphContainer, {
            generateCommitHash: createFixedHashGenerator(),
          });

          gitgraph
            .branch({ name: "master", renderLabel })
            .commit("Initial commit")
            .commit("Another commit")
            .commit("Do something crazy");

          gitgraph
            .branch({ name: "dev", renderLabel })
            .commit("Oh my god")
            .commit("Last commit of the branch");
        }}
      </GraphContainer>
    );
  })
  .add("with render tag", () => {
    const renderTag: TagOptions["render"] = (name, style) => {
      return createText({
        content: `🎷 ${name}`,
        font: style.font,
        fill: style.bgColor,
      });
    };

    return (
      <GraphContainer>
        {(graphContainer) => {
          const gitgraph = createGitgraph(graphContainer, {
            generateCommitHash: createFixedHashGenerator(),
          });

          gitgraph
            .branch("master")
            .commit("Initial commit")
            .tag({ name: "v1.0", render: renderTag });
        }}
      </GraphContainer>
    );
  });
