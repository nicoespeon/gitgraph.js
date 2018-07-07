/* tslint:disable:no-console */
import chalk from "chalk";
import { startsWith } from "lodash";

import { ILogGraph, GraphSymbol, GraphCommit } from "./compute-graph-map";

// Implements the domain interface with system's console.
const consoleGraphRenderer: ILogGraph = (graph) => {
  graph.map((line) => {
    const lineText = line
      .map(({ value, color }) => {
        const colored = startsWith(color, "#")
          ? chalk.hex(color)
          : chalk.keyword(color || "white");

        switch (value) {
          case GraphSymbol.Empty:
            return " ";

          case GraphSymbol.Branch:
            return colored("|");

          case GraphSymbol.BranchOpen:
            return colored("\\");

          case GraphSymbol.BranchMerge:
            return colored("/");

          case GraphSymbol.Commit:
            return colored("*");

          default:
            const commit = value as GraphCommit;
            let text = ` ${colored(commit.hash)} `;

            if (commit.refs.length > 0) {
              const parsedRefs = commit.refs.map((ref) => {
                return ref === "HEAD" ? chalk.bold(ref) : ref;
              });
              text += chalk.red(`(${parsedRefs.join(", ")})`);
              text += " ";
            }

            text += `${colored(commit.message)}`;

            return text;
        }
      })
      .join("");

    console.log(lineText);
  });
};

export default consoleGraphRenderer;
