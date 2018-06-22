/* tslint:disable:no-console */
import chalk from "chalk";

import { ILogGraph, GraphSymbol, GraphCommit } from "./compute-graph-map";

// Implements the domain interface with system's console.
const consoleGraphRenderer: ILogGraph = (graph) => {
  graph.map((line) => {
    const lineText = line.map((cell) => {
      switch (cell) {
        case GraphSymbol.Empty:
          return " ";

        case GraphSymbol.Branch:
          return chalk.red("|");

        case GraphSymbol.BranchOpen:
          return chalk.red("\\");

        case GraphSymbol.BranchMerge:
          return chalk.red("/");

        case GraphSymbol.Commit:
          return "*";

        default:
          const commit = (cell as GraphCommit);
          let text = ` ${chalk.green(commit.hash)} `;

          if (commit.refs.length > 0) {
            const parsedRefs = commit.refs.map((ref) => {
              return (ref === "HEAD") ? chalk.bold(ref) : ref;
            });
            text += chalk.blue(`(${parsedRefs.join(", ")})`);
            text += " ";
          }

          text += `${commit.message}`;

          return text;
      }
    })
    .join("");

    console.log(lineText);
  });
};

export default consoleGraphRenderer;
