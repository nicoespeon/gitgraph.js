import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/gitgraph.umd.js",
    format: "umd",
    name: "GitgraphJS",
    sourcemap: true,
  },
  plugins: [resolve(), commonJS(), typescript({ module: "ESNext" })],
};
