import { notes } from "mdx-deck/themes";
import highlightStyle from "react-syntax-highlighter/styles/prism/ghcolors";

import Provider from "./Provider";

export default {
  ...notes,
  css: {
    ...notes.css,
    "code[color='code']": {
      color: highlightStyle["function"].color,
      backgroundColor:
        highlightStyle[':not(pre) > code[class*="language-"]'].background,
      borderRadius: "5px",
      fontSize: "75%",
      margin: "0",
      padding: "0.2em 0.4em",
    },
    pre: {
      padding: "0.5em",
    },
    // Ensure graph elements are correctly sized
    svg: {
      fontSize: "16px",
      textAlign: "left",
      display: "block",
      marginLeft: 65,
    },
    ".sr-only": {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0",
    },
  },
  // Default code highlighter
  prism: {
    style: highlightStyle,
  },
  // Code surfer highlighter
  codeSurfer: codeSurferTheme(),
  Provider,
};

function codeSurferTheme() {
  return {
    plain: {
      color: highlightStyle['pre[class*="language-"]'].color,
      backgroundColor: highlightStyle['pre[class*="language-"]'].background,
    },
    styles: [
      {
        types: ["prolog", "constant", "builtin"],
        style: {
          color: highlightStyle["prolog"].color,
        },
      },
      {
        types: ["inserted", "function"],
        style: {
          color: highlightStyle["function"].color,
        },
      },
      {
        types: ["deleted"],
        style: {
          color: highlightStyle["deleted"].color,
        },
      },
      {
        types: ["changed"],
        style: {
          color: highlightStyle["inserted"].color,
        },
      },
      {
        types: ["punctuation", "symbol"],
        style: {
          color: highlightStyle["symbol"].color,
        },
      },
      {
        types: ["string", "char", "tag", "selector"],
        style: {
          color: highlightStyle["string"].color,
        },
      },
      {
        types: ["keyword", "variable"],
        style: {
          color: highlightStyle["keyword"].color,
          fontStyle: "italic",
        },
      },
      {
        types: ["comment"],
        style: {
          color: highlightStyle["comment"].color,
        },
      },
      {
        types: ["attr-name"],
        style: {
          color: highlightStyle["attr-name"].color,
        },
      },
    ],
  };
}
