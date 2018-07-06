import * as React from "react";
import {
  Gitgraph,
  Branch,
  Template,
  TemplateEnum,
  OrientationsEnum,
  ModeEnum
} from "../Gitgraph";

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
    if (this.state.branches.map((b: Branch) => b.name).includes(this.state.branchName)) return;
    this.setState((state: any) => ({
      branches: [...state.branches, this.state.gitgraph.branch(this.state.branchName)],
    }));
  }

  public handleChange = (name: string) => (e: React.SyntheticEvent<HTMLInputElement>): void => {
    this.setState({ [name]: e.currentTarget.value });
  }

  public clear = () => {
    this.state.gitgraph.clear();
    this.setState({
      branches: [],
    });
  }

  public render() {
    const branches: Branch[] = this.state.branches;
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
        {branches.map((branch) =>
          <form key={branch.name} onSubmit={(e) => e.preventDefault() || this.addCommit(branch)}>
            <input
              type="text"
              value={this.state[`commitMessage${branch.name}`]}
              onChange={this.handleChange(`commitMessage${branch.name}`)}
            />
            <button>Commit on {branch.name}</button>
          </form>)}
        {branches.map((to) =>
          branches
            .filter((from) => to.name !== from.name)
            .map((from) =>
              <button
                key={`${to.name}->${from.name}`}
                onClick={() => from.merge(to)}
              >Merge {to.name} into {from.name}</button>,
          ))}
        <button
          onClick={this.clear}
          style={{ position: "absolute", right: 10, top: 10 }}
        >clear</button>
        <br />
        <Gitgraph children={(gitgraph) => this.setState({ gitgraph })} />
      </div>
    );
  }
}

const templateWithoutHash = new Template({
  commit: {
    message: {
      displayHash: false,
    },
  },
});
const templateWithoutAuthor = new Template({
  commit: {
    message: {
      displayAuthor: false,
    },
  },
});
const templateWithoutBranch = new Template({
  commit: {
    message: {
      displayBranch: false,
    },
  },
});

storiesOf("Gitgraph", module)
  .add("default", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("Initial commit");
      const develop = gitgraph.branch("develop");
      develop.commit("one");
      master.commit("two");
      develop.commit("three");
      master.merge(develop);
    }}
  </Gitgraph>)
  .add("should stop on last commit", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("Initial commit");
      const develop = gitgraph.branch("develop");
      const feat = gitgraph.branch("feat");
      feat.commit();
      master.commit("five");
      develop.commit("six");
      master.merge(develop);
    }}
  </Gitgraph>)
  .add("should deal with the second branch commit", () => <Gitgraph>
    {(gitgraph) => {
      gitgraph.branch("master").commit("Initial commit");
      gitgraph.branch("develop").commit().commit();
    }}
  </Gitgraph>)
  .add("commit after merge", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph
        .branch("master")
        .commit("one")
        .commit("two")
        .commit("three");
      const develop = gitgraph.branch("develop").commit("four");
      master.commit("five");
      develop.commit("six");
      master.merge(develop);
      develop.commit("seven");
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
  .add("without commit hash", () => (
    <Gitgraph options={{ template: templateWithoutHash }}>
      {gitgraph => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
  .add("without commit author", () => (
    <Gitgraph options={{ template: templateWithoutAuthor }}>
      {gitgraph => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
  .add("without commit branch", () => (
    <Gitgraph options={{ template: templateWithoutBranch }}>
      {gitgraph => {
        gitgraph
          .commit("one")
          .commit("two")
          .commit("three");
      }}
    </Gitgraph>
  ))
  .add("branch colors", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("one");
      const develop = gitgraph.branch("develop").commit("two");
      const feat1 = gitgraph.branch("feat1").commit("three");
      const feat2 = gitgraph.branch("feat2").commit("four");
      master.commit("five");
      develop.commit("six");
      feat1.commit("seven");
      feat2.commit("height");
    }}
  </Gitgraph>)
  .add("compact mode", () => <Gitgraph options={{ mode: ModeEnum.Compact }}>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit().commit();

      // Branch has more commits.
      const develop = gitgraph.branch("develop").commit();
      master.merge(develop);

      // Branch & master have as much commits.
      const feat1 = gitgraph.branch("feat1").commit();
      master.commit();
      master.merge(feat1);

      // Master has more commits.
      const feat2 = gitgraph.branch("feat2").commit();
      master.commit().commit();
      master.merge(feat2);
    }}
  </Gitgraph>)
  .add("multiple merge", () => <Gitgraph>
  {(gitgraph) => {
    const master = gitgraph.branch("master").commit();
    const dev = gitgraph.branch("dev").commit();
    master.commit();
    dev.merge(master);
    master.commit();
  }}
</Gitgraph>)
  .add("merge party", () => <Gitgraph>
    {(gitgraph) => {
      const master = gitgraph.branch("master");
      master.commit("one").commit("two");
      const dev = gitgraph.branch("dev");
      const feat = gitgraph.branch("feat");
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

storiesOf("Gitgraph orientations", module)
  .add("vertical reverse", () => <Gitgraph options={{orientation: OrientationsEnum.VerticalReverse}}>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("Initial commit");
      const develop = gitgraph.branch("develop");
      develop.commit("one");
      master.commit("two");
      develop.commit("three");
      master.merge(develop);
    }}
  </Gitgraph>)
  .add("horizontal", () => <Gitgraph options={{orientation: OrientationsEnum.Horizontal}}>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("Initial commit");
      const develop = gitgraph.branch("develop");
      develop.commit("one");
      master.commit("two");
      develop.commit("three");
      master.merge(develop);
      master.commit();
    }}
  </Gitgraph>)
  .add("horizontal reverse", () => <Gitgraph options={{orientation: OrientationsEnum.HorizontalReverse}}>
    {(gitgraph) => {
      const master = gitgraph.branch("master").commit("Initial commit");
      const develop = gitgraph.branch("develop");
      develop.commit("one");
      master.commit("two");
      develop.commit("three");
      master.merge(develop);
      master.commit();
    }}
  </Gitgraph>);
