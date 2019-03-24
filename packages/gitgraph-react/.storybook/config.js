import "storybook-chromatic";
import { addParameters, configure } from "@storybook/react";

addParameters({
  options: {
    name: "@gitgraph/react",
    url:
      "https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-react",
    hierarchySeparator: null,
  },
});

// automatically import all files ending in *.stories.tsx
const req = require.context("../src/stories", true, /.stories.tsx$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
