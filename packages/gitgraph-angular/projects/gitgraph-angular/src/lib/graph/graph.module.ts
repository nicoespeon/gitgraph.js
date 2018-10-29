import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DotComponent } from "./dot/dot.component";
import { GraphComponent } from "./graph.component";

@NgModule({
  imports: [CommonModule],
  declarations: [GraphComponent, DotComponent],
  exports: [GraphComponent],
})
export class GraphModule {}
