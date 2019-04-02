// @ts-ignore: @storybook/html doesn't have types yet
import { storiesOf } from "@storybook/html";
import { action } from "@storybook/addon-actions";

import { createFixedHashGenerator } from "./helpers";
import { createGitgraph } from "../gitgraph";

storiesOf("3. Events", module).add("on commit dot click", () => {
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
});
