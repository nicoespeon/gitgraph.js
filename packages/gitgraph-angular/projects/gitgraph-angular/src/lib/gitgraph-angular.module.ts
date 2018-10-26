import { NgModule } from "@angular/core";
import { GitgraphAngularComponent } from "./gitgraph-angular.component";
import { GraphComponent } from "./graph/graph.component";

@NgModule({
  imports: [],
  declarations: [GitgraphAngularComponent, GraphComponent],
  exports: [GitgraphAngularComponent, GraphComponent],
})
export class GitgraphAngularModule {}
