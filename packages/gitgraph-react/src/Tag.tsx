import * as React from "react";
import { Commit } from "@gitgraph/core";

interface Props {
  name: string;
  commit: Commit<React.ReactElement<SVGElement>>;
}

interface State {
  textWidth: number;
  textHeight: number;
}

export class Tag extends React.Component<Props, State> {
  public static readonly paddingX = 10;
  public static readonly paddingY = 5;
  public readonly state = { textWidth: 0, textHeight: 0 };

  private $text = React.createRef<SVGTextElement>();

  public componentDidMount() {
    const box = this.$text.current!.getBBox();
    this.setState({ textWidth: box.width, textHeight: box.height });
  }

  public render() {
    const { name, commit } = this.props;

    const style = {
      bgColor: commit.style.color,
      borderRadius: 10,
      pointerWidth: 12,
      color: "white",
      font: commit.style.message.font,
    };

    const offset = style.pointerWidth;
    const radius = style.borderRadius;
    const boxWidth = offset + this.state.textWidth + 2 * Tag.paddingX;
    const boxHeight = this.state.textHeight + 2 * Tag.paddingY;

    const path = [
      "M 0,0",
      `L ${offset},${boxHeight / 2}`,
      `V ${boxHeight / 2}`,
      `Q ${offset},${boxHeight / 2} ${offset + radius},${boxHeight / 2}`,
      `H ${boxWidth - radius}`,
      `Q ${boxWidth},${boxHeight / 2} ${boxWidth},${boxHeight / 2 - radius}`,
      `V -${boxHeight / 2 - radius}`,
      `Q ${boxWidth},-${boxHeight / 2} ${boxWidth - radius},-${boxHeight / 2}`,
      `H ${offset + radius}`,
      `Q ${offset},-${boxHeight / 2} ${offset},-${boxHeight / 2}`,
      `V -${boxHeight / 2}`,
      "z",
    ].join(" ");

    return (
      <g transform={`translate(0, ${commit.style.dot.size})`}>
        <path d={path} fill={style.bgColor} />
        <text
          ref={this.$text}
          fill={style.color}
          style={{ font: style.font }}
          alignmentBaseline="middle"
          x={offset + Tag.paddingX}
          y={0}
        >
          {name}
        </text>
      </g>
    );
  }
}
