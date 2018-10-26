import { Component, OnInit, Input } from "@angular/core";

import { GitgraphCore } from "gitgraph-core/lib/index";

@Component({
  selector: "gg-gitgraph-angular",
  template: `
    <p>
      gitgraph-angular works! {{core}}
    </p>
  `,
  styles: [],
})
export class GitgraphAngularComponent implements OnInit {
  @Input() core: GitgraphCore;

  constructor() {}

  ngOnInit() {
    // this.core.subscribe(this.onGitgraphCoreRender.bind(this));
  }
}
