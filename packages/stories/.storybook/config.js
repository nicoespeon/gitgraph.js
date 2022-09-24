import "storybook-chromatic";
import { addParameters, configure } from "@storybook/react";

// addParameters({
//   options: {
//     name: "Gitgraph.js",
//     url: "https://github.com/nicoespeon/gitgraph.js/",
//     hierarchySeparator: "/",
//   },
// });

// Automatically import all files ending in *.stories.tsx
const req = require.context("../src", true, /.stories.tsx$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
