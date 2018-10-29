import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { GraphModule } from "./graph/graph.module";

@NgModule({
  imports: [BrowserModule, GraphModule],
  exports: [GraphModule],
})
export class GitgraphAngularModule {}
