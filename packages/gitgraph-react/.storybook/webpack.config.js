const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve(__dirname, "../src"),
        loader: require.resolve("ts-loader")
      }
    ]
  }
};
