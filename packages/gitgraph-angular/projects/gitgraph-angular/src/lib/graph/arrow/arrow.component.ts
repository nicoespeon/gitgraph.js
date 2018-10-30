import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";

import { Commit, Coordinate, GitgraphCore } from "gitgraph-core";
import { arrowSvgPath } from "gitgraph-core/lib/utils";

@Component({
  // tslint:disable-next-line:component-selector
  selector: "[gg-arrow]",
  templateUrl: "./arrow.component.html",
  styleUrls: ["./arrow.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrowComponent implements OnInit {
  @Input() public commit: Commit;
  @Input() public parent: Commit;
  @Input() public reverseArrow: boolean;
  @Input() public color: string;
  @Input() public core: GitgraphCore;

  public path: string;

  public origin: Coordinate;
  constructor() {}

  public ngOnInit(): void {
    const commitRadius = this.commit.style.dot.size;

    // Starting point, relative to commit
    this.origin = {
      x: this.reverseArrow
        ? commitRadius + (this.parent.x - this.commit.x)
        : commitRadius,
      y: this.reverseArrow
        ? commitRadius + (this.parent.y - this.commit.y)
        : commitRadius,
    };

    this.path = arrowSvgPath(this.core, this.parent, this.commit);
  }
}
