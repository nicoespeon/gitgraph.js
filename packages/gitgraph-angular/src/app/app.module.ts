import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { GitgraphAngularModule } from "gitgraph-angular";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GitgraphAngularModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
