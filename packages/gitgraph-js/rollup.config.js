import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
  input: "lib/index.js",
  output: {
    file: "lib/gitgraph.umd.js",
    format: "umd",
    name: "GitgraphJS",
  },
  plugins: [resolve(), commonJS()],
};
