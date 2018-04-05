import * as React from "react";
import { Gitgraph, Branch, TemplateEnum } from "../Gitgraph";

import { storiesOf } from "@storybook/react";

class GitgraphPlayground extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      branches: [],
    };
  }

  public addCommit = (branch?: Branch) => {
    if (branch) {
      branch.commit(this.state[`commitMessage${branch.name}`]);
    } else {
      this.state.gitgraph.commit(this.state.commitMessage);
    }
  }

  public addBranch = () => {
    this.setState((state: any) => ({
      branches: [...state.branches, this.state.gitgraph.branch(this.state.branchName)],
    }));
  }

  public handleChange = (name: string) => (e: React.SyntheticEvent<HTMLInputElement>): void => {
    this.setState({ [name]: e.currentTarget.value });
  }

  public render() {
    return (
      <div>
        <form onSubmit={(e) => e.preventDefault() || this.addCommit()}>
          <input type="text" value={this.state.commitMessage} onChange={this.handleChange("commitMessage")} />
          <button>Commit on HEAD</button>
        </form>
        <form onSubmit={(e) => e.preventDefault() || this.addBranch()}>
          <input type="text" onChange={this.handleChange("branchName")} />
          <button>Add a branch</button>
        </form>
        {this.state.branches.map((branch: Branch) =>
          <form key={branch.name} onSubmit={(e) => e.preventDefault() || this.addCommit(branch)}>
            <input
              type="text"
              value={this.state[`commitMessage${branch.name}`]}
              onChange={this.handleChange(`commitMessage${branch.name}`)}
            />
            <button>Commit on {branch.name}</button>
          </form>)}
        <Gitgraph children={(gitgraph) => this.setState({ gitgraph })} />
      </div>
    );
  }
}

storiesOf("Gitgraph", module)
  .add("default", () => <Gitgraph>
    {(gitgraph) => {
      gitgraph
        .branch("master")
        .commit("one")
        .commit("two")
        .commit("three");
    }}
  </Gitgraph>)
  .add("blackArrow", () => <Gitgraph options={{ template: TemplateEnum.BlackArrow }}>
    {(gitgraph) => {
      const master = gitgraph
        .branch("master")
        .commit("one")
        .commit("two")
        .commit("three");
      const develop = gitgraph.branch("develop").commit("four");
      master.merge(develop);
    }}
  </Gitgraph>)
  .add("merge party", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph.branch("master");
      const dev = gitgraph.branch("dev");
      const feat = gitgraph.branch("feat");
      master.commit("one").commit("two");
      dev.commit("three").commit("four");
      master.commit("five");
      dev.merge(master);
      master.commit("six");
      dev.commit("seven");
      feat.commit("eight");
      master.merge(feat);
      master.merge(dev);
    }}
  </Gitgraph>)
  .add("with playground", () => <GitgraphPlayground />);
