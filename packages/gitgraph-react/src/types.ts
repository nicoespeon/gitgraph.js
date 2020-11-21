import * as React from "react";
import {
  GitgraphCommitOptions,
  GitgraphBranchOptions,
  GitgraphTagOptions,
  GitgraphMergeOptions,
  BranchUserApi,
} from "@gitgraph/core";

export type ReactSvgElement = React.ReactElement<SVGElement>;

export type CommitOptions = GitgraphCommitOptions<ReactSvgElement>;
export type BranchOptions = GitgraphBranchOptions<ReactSvgElement>;
export type TagOptions = GitgraphTagOptions<ReactSvgElement>;
export type MergeOptions = GitgraphMergeOptions<ReactSvgElement>;
export type Branch = BranchUserApi<ReactSvgElement>;
