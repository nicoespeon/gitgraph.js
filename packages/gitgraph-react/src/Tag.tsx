import * as React from "react";
import { Tag as CoreTag } from "@gitgraph/core";

interface Props {
  tag: CoreTag;
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
    const { tag } = this.props;

    const offset = tag.style.pointerWidth;
    const radius = tag.style.borderRadius;
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
      <g>
        <path
          d={path}
          fill={tag.style.bgColor}
          stroke={tag.style.strokeColor}
        />
        <text
          ref={this.$text}
          fill={tag.style.color}
          style={{ font: tag.style.font }}
          alignmentBaseline="middle"
          dominantBaseline="middle"
          x={offset + Tag.paddingX}
          y={0}
        >
          {tag.name}
        </text>
      </g>
    );
  }
}
