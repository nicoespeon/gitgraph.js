const globals = {
  "@gitgraph/core": "gitgraph.core",
};

export default {
  input: "lib/index.js",
  output: {
    file: "lib/bundle.umd.js",
    format: "umd",
  },
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
