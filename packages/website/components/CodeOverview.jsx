import React from "react";
import { CodeSurfer } from "mdx-deck-code-surfer";

import theme from "../theme";

export { BasicUsage };

function BasicUsage(props) {
  return (
    <CodeSurfer
      code={require("!raw-loader!./snippets/basic-usage.js")}
      lang="javascript"
      showNumbers={false}
      dark={false}
      steps={[
        {
          title: () => <TitleH2 text={props.title} />,
        },
        { lines: [1], title: () => <TitleH3 text="Create a first branch" /> },
        { lines: [2], title: () => <TitleH3 text="Commit on it" /> },
        { range: [4, 7], title: () => <TitleH3 text="Add more commits" /> },
        { lines: [9], title: () => <TitleH3 text="Add tags" /> },
        {
          lines: [11, 12],
          title: () => <TitleH3 text="Create new branches" />,
        },
        {
          lines: [14, 15],
          title: () => <TitleH3 text="Add commits on any branch" />,
        },
        { lines: [17, 18], title: () => <TitleH3 text="Merge branches" /> },
        { title: () => <TitleH3 text="You know how to draw git graphs 😎" /> },
      ]}
    />
  );
}

function TitleH2(props) {
  return (
    <h2
      style={{ color: theme.colors.text, fontSize: theme.fontSizes[3] }}
      dangerouslySetInnerHTML={{ __html: parseHtml(props.text) }}
    />
  );
}

function TitleH3(props) {
  return (
    <h3
      style={{ color: theme.colors.text, fontSize: theme.fontSizes[2] }}
      dangerouslySetInnerHTML={{ __html: parseHtml(props.text) }}
    />
  );
}

function parseHtml(text) {
  return text.replace(/`(\w+)`/, "<code color='code'>$1</code>");
}
