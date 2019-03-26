import { GitgraphCore } from "@gitgraph/core";

export { createGitgraph };

function createGitgraph(graphContainer: HTMLElement) {
  const gitgraph = new GitgraphCore();
  gitgraph.subscribe((data) => {
    const { commits } = data;

    const commitsElements = commits.map((commit) => {
      const element = document.createElement("p");
      element.innerHTML = `(x) [${commit.hashAbbrev}] ${commit.subject}`;
      return element;
    });

    graphContainer.innerHTML = "";
    commitsElements.forEach((element) => graphContainer.appendChild(element));
  });

  return gitgraph.getUserApi();
}
