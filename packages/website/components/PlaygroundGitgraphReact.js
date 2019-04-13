import React from "react";
import { Gitgraph, templateExtend } from "@gitgraph/react";
import { LiveCode } from "mdx-deck-live-code";

export default function PlaygroundGitgraphReact() {
  return (
    <LiveCode
      size="fullscreen"
      code={`<Gitgraph>
  {gitgraph => {}}
</Gitgraph>`}
      providerProps={{
        scope: { Gitgraph, templateExtend },
      }}
      editorProps={{
        style: {
          fontSize: "18px",
          color: "white",
        },
      }}
      errorProps={{
        style: {
          fontSize: "20px",
        },
      }}
    />
  );
}
