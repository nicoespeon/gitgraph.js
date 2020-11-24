import * as React from "react";
import { Commit } from "@gitgraph/core";

export class Tooltip extends React.Component<
  { commit: Commit<React.ReactElement<SVGElement>> },
  { textWidth: number }
> {
  public static readonly padding = 10;
  public readonly state = { textWidth: 0 };
  private $text = React.createRef<SVGTextElement>();

  public componentDidMount() {
    this.setState({ textWidth: this.$text.current!.getBBox().width });
  }

  public render() {
    if (this.props.commit.renderTooltip) {
      return this.props.commit.renderTooltip(this.props.commit);
    }

    const commitSize = this.props.commit.style.dot.size * 2;
    const offset = 10;
    const padding = Tooltip.padding;
    const radius = 5;
    const boxHeight = 50;
    const boxWidth = offset + this.state.textWidth + 2 * padding;

    const path = [
      "M 0,0",
      `L ${offset},${offset}`,
      `V ${boxHeight / 2 - radius}`,
      `Q ${offset},${boxHeight / 2} ${offset + radius},${boxHeight / 2}`,
      `H ${boxWidth - radius}`,
      `Q ${boxWidth},${boxHeight / 2} ${boxWidth},${boxHeight / 2 - radius}`,
      `V -${boxHeight / 2 - radius}`,
      `Q ${boxWidth},-${boxHeight / 2} ${boxWidth - radius},-${boxHeight / 2}`,
      `H ${offset + radius}`,
      `Q ${offset},-${boxHeight / 2} ${offset},-${boxHeight / 2 - radius}`,
      `V -${offset}`,
      "z",
    ].join(" ");

    return (
      <g transform={`translate(${commitSize}, ${commitSize / 2})`}>
        <path d={path} fill="#EEE" />
        <text
          ref={this.$text}
          x={offset + padding}
          y={0}
          alignmentBaseline="central"
          fill="#333"
        >
          {this.props.children}
        </text>
      </g>
    );
  }
}
