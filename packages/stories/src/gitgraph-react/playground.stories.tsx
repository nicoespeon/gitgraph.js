import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Gitgraph, Branch } from "@gitgraph/react";

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
  };

  public addBranch = () => {
    if (
      this.state.branches
        .map((b: Branch) => b.name)
        .includes(this.state.branchName)
    )
      return;
    this.setState((state: any) => ({
      branches: [
        ...state.branches,
        this.state.gitgraph.branch(this.state.branchName),
      ],
    }));
  };

  public handleChange = (name: string) => (
    e: React.SyntheticEvent<HTMLInputElement>,
  ): void => {
    this.setState({ [name]: e.currentTarget.value });
  };

  public clear = () => {
    this.state.gitgraph.clear();
    this.setState({
      branches: [],
    });
  };

  public render() {
    const branches = this.state.branches as Branch[];
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.addCommit();
          }}
        >
          <input
            type="text"
            value={this.state.commitMessage}
            onChange={this.handleChange("commitMessage")}
          />
          <button>Commit on HEAD</button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.addBranch();
          }}
        >
          <input type="text" onChange={this.handleChange("branchName")} />
          <button>Add a branch</button>
        </form>
        {branches.map((branch) => (
          <form
            key={branch.name}
            onSubmit={(e) => {
              e.preventDefault();
              this.addCommit(branch);
            }}
          >
            <input
              type="text"
              value={this.state[`commitMessage${branch.name}`]}
              onChange={this.handleChange(`commitMessage${branch.name}`)}
            />
            <button>Commit on {branch.name}</button>
          </form>
        ))}
        {branches.map((to) =>
          branches.filter((from) => to.name !== from.name).map((from) => (
            <button
              key={`${to.name}->${from.name}`}
              onClick={() => from.merge(to)}
            >
              Merge {to.name} into {from.name}
            </button>
          )),
        )}
        <button
          onClick={this.clear}
          style={{ position: "absolute", right: 10, top: 10 }}
        >
          clear
        </button>
        <br />
        <Gitgraph children={(gitgraph) => this.setState({ gitgraph })} />
      </div>
    );
  }
}

storiesOf("gitgraph-react/Playground", module).add("default", () => (
  <GitgraphPlayground />
));
