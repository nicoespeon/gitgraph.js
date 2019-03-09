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

    const boxWidth = this.state.textWidth + 2 * Tag.paddingX;
    const boxHeight = this.state.textHeight + 2 * Tag.paddingY;

    const style = {
      strokeColor: commit.style.color,
      bgColor: commit.style.color,
      borderRadius: 10,
      color: "white",
      font: commit.style.message.font,
    };

    return (
      <g>
        {/* TODO: render a tag-like box, with "<" on the left side */}
        <rect
          stroke={style.strokeColor}
          fill={style.bgColor}
          rx={style.borderRadius}
          width={boxWidth}
          height={boxHeight}
        />
        <text
          ref={this.$text}
          fill={style.color}
          style={{ font: style.font }}
          alignmentBaseline="middle"
          x={Tag.paddingX}
          y={boxHeight / 2}
        >
          {name}
        </text>
      </g>
    );
  }
}
