import {
  BranchUserApi,
  GitgraphBranchOptions,
  GitgraphCommitOptions,
  GitgraphMergeOptions,
  GitgraphTagOptions,
} from "@dolthub/gitgraph-core";
import * as React from "react";

export type ReactSvgElement = React.ReactElement<SVGElement>;

export type CommitOptions = GitgraphCommitOptions<ReactSvgElement>;
export type BranchOptions = GitgraphBranchOptions<ReactSvgElement>;
export type TagOptions = GitgraphTagOptions<ReactSvgElement>;
export type MergeOptions = GitgraphMergeOptions<ReactSvgElement>;
export type Branch = BranchUserApi<ReactSvgElement>;
