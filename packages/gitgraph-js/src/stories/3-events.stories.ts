// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";
import { action } from "@storybook/addon-actions";

import { createFixedHashGenerator } from "./helpers";
import { createGitgraph } from "../gitgraph";

storiesOf("3. Events", module)
  .add("on commit dot click", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const onClick = action("click on dot");

    const master = gitgraph.branch("master");
    master.commit({
      subject: "Hello",
      onClick,
    });
    master.commit({
      subject: "World",
      onClick,
    });

    return graphContainer;
  })
  .add("on commit dot mouseover", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const onMouseOver = action("mouse over dot");

    const master = gitgraph.branch("master");
    master.commit({ subject: "Hello", onMouseOver });
    master.commit({ subject: "World", onMouseOver });

    return graphContainer;
  })
  .add("on commit dot mouseout", () => {
    const graphContainer = document.createElement("div");

    const gitgraph = createGitgraph(graphContainer, {
      generateCommitHash: createFixedHashGenerator(),
    });

    const onMouseOut = action("mouse out dot");

    const master = gitgraph.branch("master");
    master.commit({ subject: "Hello", onMouseOut });
    master.commit({ subject: "World", onMouseOut });

    return graphContainer;
  });
