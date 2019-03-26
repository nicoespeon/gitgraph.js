import { addParameters, configure } from "@storybook/html";

addParameters({
  options: {
    name: "@gitgraph/js",
    url:
      "https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-js",
    hierarchySeparator: null,
  },
});

// automatically import all files ending in *.stories.ts
const req = require.context("../src/stories", true, /.stories.ts$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
