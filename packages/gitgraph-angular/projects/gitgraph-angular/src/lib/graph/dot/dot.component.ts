import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";

import { Commit } from "gitgraph-core";

@Component({
  // tslint:disable-next-line:component-selector
  selector: "[gg-dot]",
  templateUrl: "./dot.component.html",
  styleUrls: ["./dot.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DotComponent implements OnInit {
  @Input() public commit: Commit;

  constructor() {}

  ngOnInit() {}
}
