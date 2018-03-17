const path = require("path");

module.exports = storybookBaseConfig => {
  storybookBaseConfig.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, "../src"),
    loader: require.resolve("ts-loader")
  });

  storybookBaseConfig.resolve.extensions.push(".ts", ".tsx");

  return storybookBaseConfig;
};
