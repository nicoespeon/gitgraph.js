import { RenderedData } from "gitgraph-core/lib/index";

export default render;

export interface IRenderGraph {
  commit(hash: string, subject: string): void;
}

function render(logger: IRenderGraph, data: RenderedData): void {
  data.commits.forEach((commit, index) => {
    logger.commit(commit.hashAbbrev, commit.subject);
  });
}
