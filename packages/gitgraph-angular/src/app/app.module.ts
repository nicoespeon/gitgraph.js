import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { GitgraphAngularModule } from "gitgraph-angular";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GitgraphAngularModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
