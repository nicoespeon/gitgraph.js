import { Component } from "@angular/core";

import { GitgraphCore, Commit } from "gitgraph-core";

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
  }

  public commit(): void {
    function onMessageClick(commit: Commit) {
      alert(`Commit ${commit.hashAbbrev} clicked: '${commit.subject}'`);
    }

    const master = this.core.branch("master");
    master.commit({
      subject: "Hello",
      body: "First commit",
      onMessageClick,
    });
    master.commit({
      subject: "World",
      body: "Second commit",
      onMessageClick,
    });
  }
}
