import typescript from "@rollup/plugin-typescript";

const globals = {
  "@gitgraph/core": "gitgraph.core",
};

export default {
  input: "src/index.tsx",
  output: {
    name: "GitgraphReact",
    file: "dist/bundle.umd.js",
    format: "umd",
  },
  plugins: [typescript({ module: "ESNext" })],
  name: "GitgraphReact",
  exports: "named",
  sourcemap: true,
  external: Object.keys(globals),
  onwarn,
  globals,
};

function onwarn(message) {
  const suppressed = ["UNRESOLVED_IMPORT", "THIS_IS_UNDEFINED"];

  if (!suppressed.find((code) => message.code === code)) {
    return console.warn(message.message);
  }
}
