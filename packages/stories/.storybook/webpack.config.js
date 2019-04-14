const path = require("path");

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, "../src"),
    loaders: [
      {
        loader: require.resolve("@storybook/addon-storysource/loader"),
        options: { parser: "typescript" },
      },
      require.resolve("ts-loader"),
    ],
  });

  config.resolve.extensions.push(".ts", ".tsx");

  return config;
};
