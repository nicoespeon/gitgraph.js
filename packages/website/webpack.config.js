const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  resolve: {
    alias: {
      // Ensure we resolve the same React copy than @gitgraph/react
      // Otherwise, we can't use hooks!
      // See https://github.com/facebook/react/issues/13991#issuecomment-435587809
      react: path.resolve("./node_modules/react"),
    },
  },
};
