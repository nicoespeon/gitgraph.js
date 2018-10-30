import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ArrowComponent } from "./arrow/arrow.component";
import { DotComponent } from "./dot/dot.component";
import { GraphComponent } from "./graph.component";
import { MessageComponent } from "./message/message.component";

@NgModule({
  imports: [CommonModule],
  declarations: [GraphComponent, DotComponent, ArrowComponent, MessageComponent],
  exports: [GraphComponent],
})
export class GraphModule {}
