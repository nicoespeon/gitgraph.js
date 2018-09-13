const baseProjectConfig = {
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
};

module.exports = {
  projects: [
    {
      ...baseProjectConfig,
      displayName: "core",
      rootDir: "<rootDir>/packages/gitgraph-core/",
    },
    {
      ...baseProjectConfig,
      displayName: "node",
      rootDir: "<rootDir>/packages/gitgraph-node/",
    },
    {
      ...baseProjectConfig,
      displayName: "react",
      rootDir: "<rootDir>/packages/gitgraph-react/",
    },
  ],
};
