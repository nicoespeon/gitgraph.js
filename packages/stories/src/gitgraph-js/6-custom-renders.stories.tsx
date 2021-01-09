import * as React from "react";
import {storiesOf} from "@storybook/react";
import {
  BranchOptions,
  Commit,
  CommitOptions,
  createGitgraph,
  Mode,
  Orientation,
  Renderer,
  TagOptions,
  templateExtend,
  TemplateName,
} from "@gitgraph/js";

import {
  createFixedHashGenerator,
  createForeignObject,
  createG,
  createPath,
  createRect,
  createSvg,
  createText,
  GraphContainer,
} from "../helpers";
import {Coordinate} from "@gitgraph/core/lib/branches-paths";
import {PADDING_X as BRANCH_LABEL_PADDING_X} from "@gitgraph/js/lib/branch-label";
import {PADDING_X as TAG_PADDING_X} from "@gitgraph/js/lib/tag";

const withoutBranchLabels = templateExtend(TemplateName.Metro, {
  branch: { label: { display: false } },
});

const renderSax: CommitOptions["renderDot"] = (commit: any) =>
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

const renderLongMessage: CommitOptions["renderMessage"] = (commit: any) => {
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
        const renderDot: CommitOptions["renderDot"] = (commit: any) =>
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
        const renderTooltip: CommitOptions["renderTooltip"] = (commit: any) => {
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
        const renderMessage: CommitOptions["renderMessage"] = (commit: any) => {
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
    const renderLabel: BranchOptions["renderLabel"] = (branch: any) => {
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
    const renderTag: TagOptions["render"] = (name: any, style: any) => {
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
  })
  .add("custom renderer - message below tags", () => {
    // Providing a custom Renderer class can enable limitless customization.
    // However -
    // NOTE: using a custom Renderer can be considered advanced and experimental.
    //   1. You will have to read the code to figure out which methods to override.
    //   2. The internal API (ie. the Renderer methods and variables) is *internal* and
    //      may change in the future.
    //
    // In this example we move the "message" group down instead of to the right of the tags

    // CustomRenderer class - note the vanilla JS syntax as it appears in storybook
    // is "ugly" but modern browsers support the `class` keyword which provides
    // prettier syntax. The source code for this story uses the ES6 class, which gets
    // transpiled to the prototype-based syntax you see in storybook component explorer.
    class MessageBelowTagsRenderer extends Renderer {

      // copied the entire `positionCommitsElements` method with a tiny change
      // see the lines marked with "** changed **" for the difference
      positionCommitsElements() {
        if (this.gitgraph.isHorizontal) {
          // Elements don't appear on horizontal mode, yet.
          return;
        }

        const padding = 10;

        // Ensure commits elements (branch labels, message…) are well positionned.
        // It can't be done at render time since elements size is dynamic.
        Object.keys(this.commitsElements).forEach((commitHash) => {
          const {branchLabel, tags, message} = this.commitsElements[commitHash];

          // We'll store X position progressively and translate elements.
          let x = this.commitMessagesX;

          if (branchLabel) {
            this.moveElement(branchLabel, x);

            // BBox width misses box padding
            // => they are set later, on branch label update.
            // We would need to make branch label update happen before to solve it.
            const branchLabelWidth =
                branchLabel.getBBox().width + 2 * BRANCH_LABEL_PADDING_X;
            x += branchLabelWidth + padding;
          }
          let highestTag = 0; // ** changed ** keeping track of highest tag
          tags.forEach((tag) => {
            this.moveElement(tag, x);

            // BBox width misses box padding and offset
            // => they are set later, on tag update.
            // We would need to make tag update happen before to solve it.
            const offset = parseFloat(tag.getAttribute("data-offset") || "0");
            const tagWidth = tag.getBBox().width + 2 * TAG_PADDING_X + offset;
            x += tagWidth + padding;

            // ** changed ** - keeping track of highest tag
            highestTag = Math.max(highestTag, tag.getBBox().height)
          });

          if (message) {
            // ** changed ** - moving the message down instead of to the right
            this.moveElementByXY(message, this.commitMessagesX, highestTag+padding+8);
            // this.moveElement(message, x);
          }
        });
      }
    }

    return (
        <GraphContainer>
          {(graphContainer) => {

            const gitgraph = createGitgraph(graphContainer, {
                  generateCommitHash: createFixedHashGenerator(),
                },
                () => {
                  // keep reference to renderer so we can call re-render whenever `selectedCommit` changes
                  return new MessageBelowTagsRenderer(graphContainer);
                });

            var master = gitgraph.branch('master');
            // Tag on branch
            master
              .commit()
              .tag('v1.0')
              .tag('first release');
            master.commit();
            master.tag('v1.1');
            master.commit({ tag: 'v1.2' });
            // Tag on gitgraph
            master.commit("This is good for narrower diagrams");
            gitgraph.tag('v2.0');
            // Custom tags
            var customTagStyle = {
              bgColor: 'orange',
              strokeColor: 'orange',
              borderRadius: 0,
              pointerWidth: 0,
            };
            gitgraph.tag({
              name: 'last release',
              style: customTagStyle,
            });
            gitgraph
              .branch('feat1')
              .commit("Message appears below the tags")
              .tag({ name: 'something cool', style: customTagStyle });
          }}
        </GraphContainer>
    )
  })
  .add("custom renderer - background rect", () => {
    // Providing a custom Renderer class can enable limitless customization.
    // However -
    // NOTE: using a custom Renderer can be considered advanced and experimental.
    //   1. You will have to read the code to figure out which methods to override.
    //   2. The internal API (ie. the Renderer methods and variables) is *internal* and
    //      may change in the future.
    //
    // In this example we add a background rectangle to the commit which will change
    // fill-color on hover and if selected.
    //
    // HOVER over the commits, and CLICK to see the background change

    let selectedCommit: Commit|null = null;
    let renderer: any;
    // CustomRenderer class - note the vanilla JS syntax as it appears in storybook
    // is "ugly" but modern browsers support the `class` keyword which provides
    // prettier syntax. The source code for this story uses the ES6 class, which gets
    // transpiled to the prototype-based syntax you see in storybook component explorer.
    class BackgroundRectRenderer extends Renderer {
        createCommitGroup(commit: Commit, {x, y}: Coordinate): SVGGElement {
          const result = super.createCommitGroup(commit, {x,y})
          result.setAttribute("class", commit === selectedCommit ? "commit-row selected" : "commit-row")
          result.addEventListener("click", function() {
            selectedCommit = commit;
            // Using the `rerender` method will render again
            // using the same data as before - on modern browsers
            // it will keep the vertical scroll location
            renderer.rerender()
          })
          return result;
        }
        getCommitGroupChildren(commit: Commit, {x, y}: Coordinate): Array<SVGElement | null> {
          // we have to provide explicit dimensions for the background rect
          // (unfortunately SVG does not support having a rect as a expanding container)
          let height = 0;
          // find the minimum height (Y-distance to parent)
          this.getParentCommits(commit).forEach(parent => {
            if (parent) {
              const parentY = this.getWithCommitOffset(parent).y;
              height = Math.max(height, parentY - y);
            }
          })
          const rect = createRect({
            width: this.svg.clientWidth-20,
            height: height,
            translate: {x:-6, y:-6}
          })

          return [
            rect,
            ...super.getCommitGroupChildren(commit, {x,y}),
          ]
        }
        getSvgChildren(): Array<SVGElement> {
          // flip the order of main svg children so that paths are on top
          // of the rects, otherwise the rects hide the branch-paths
          // (unfortunately SVG does not support z-index)
          return [this.$commits!, this.renderBranchesPaths(this.lastData!.branchesPaths)];
        }
      }


    // avoid appending the css style each time the component is rendered
    if (!document.getElementById("commit-rect-background-example-style")) {
      const styleElement = document.createElement("style")
      styleElement.id = "commit-rect-background-example-style";
      styleElement.innerHTML = `
        .commit-row  {   fill: #fff; cursor: pointer;    }
        .commit-row:hover  {   fill: #ffc;  }
        .commit-row.selected  {  fill: #ee9;   }
        .commit-row.selected:hover  {   fill: #ee6;   }
      `
      document.head.appendChild(styleElement)
    }
    return (
      <GraphContainer>
        {(graphContainer) => {


          const gitgraph = createGitgraph(graphContainer, {
            generateCommitHash: createFixedHashGenerator(),
          },
              () => {
                // keep reference to renderer so we can call re-render whenever `selectedCommit` changes
                renderer = new BackgroundRectRenderer(graphContainer);
                return renderer;
              });

          gitgraph
            .branch("master")
            .commit("Initial commit")
          for (let i=1; i<=10; i++) {
            gitgraph.commit("commit "+i);
          }
          gitgraph.commit({
            subject: 'Long message - ',
            body: `This is a very long message.
             The background rect should be larger here
             which isn't trivial in the SVG-land. 
             Now for some more fluff text to make this message long -
             SVG really makes you appreciate the magic that HTML 
             rendering is doing. Remember to drink water often.
             I'm very happy 2020 is over, it really sucked.
             But I like working from home, I hope that part stays.
             `
          })
          for (let i=11; i<=14; i++) {
            gitgraph.commit("commit "+i);
          }
          setTimeout(function() {
            // after the component is attached to the page the size changes
            // so we need to rerender with the new size
            renderer.rerender();
          }, 1)
        }}
      </GraphContainer>
    );
  });

