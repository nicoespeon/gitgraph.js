import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";

@Component({
  // tslint:disable-next-line:component-selector
  selector: "[gg-message]",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent implements OnInit {
  @Input() public x: number;
  @Input() public y: number;
  @Input() public fill: string;
  @Input() public font: string;

  constructor() {}

  ngOnInit() {}
}
