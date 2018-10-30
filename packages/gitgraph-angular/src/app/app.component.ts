import { Component } from "@angular/core";

import { Commit, GitgraphCore } from "gitgraph-core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public title = "gitgraph-angular-workspace";
  public core: GitgraphCore;

  constructor() {
    this.core = new GitgraphCore();
    this.core.template.arrow.size = 1;
    this.core.template.arrow.color = "000";
  }

  public commit(): void {
    // const master = this.core.branch("master");
    // master.commit({
    //   subject: "Hello",
    //   body: "First commit",
    //   onMessageClick: this.onClick,
    // });
    // master.commit({
    //   subject: "World",
    //   body: "Second commit",
    //   onMessageClick: this.onClick,
    // });

    const master = this.core.branch("master").commit("Initial commit");
    const develop = this.core.branch("develop");
    develop.commit("one");
    master.commit("two");
    develop.commit("three");
    master.merge(develop);
    master.commit();
  }

  private onClick(commit: Commit): void {
    alert(`Commit ${commit.hashAbbrev} clicked: '${commit.subject}'`);

  }
}
