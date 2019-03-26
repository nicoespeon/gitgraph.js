const path = require("path");

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.ts$/,
    include: path.resolve(__dirname, "../src"),
    loader: require.resolve("ts-loader"),
  });

  config.resolve.extensions.push(".ts");

  return config;
};
