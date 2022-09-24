import typescript from "@rollup/plugin-typescript";

const globals = {
  "@gitgraph/core": "gitgraph.core",
  react: "React",
};

export default {
  input: "src/index.tsx",
  output: {
    // name: "@gitgraph/react",
    file: "dist/bundle.umd.js",
    format: "umd",

    name: "GitgraphReact",
    exports: "named",
    sourcemap: true,

    globals: globals,
  },
  plugins: [typescript({ module: "ESNext" })],
  onwarn,
};

function onwarn(message) {
  const suppressed = ["UNRESOLVED_IMPORT", "THIS_IS_UNDEFINED"];

  if (!suppressed.find((code) => message.code === code)) {
    return console.warn(message.message);
  }
}
