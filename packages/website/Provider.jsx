import React from "react";
import { Provider as DefaultProvider } from "mdx-deck";
import GithubCorner from "react-github-corner";

export default Provider;

function Provider(props) {
  return (
    <>
      <DefaultProvider {...props} />
      <GithubCorner href="https://github.com/nicoespeon/gitgraph.js/" />
    </>
  );
}
