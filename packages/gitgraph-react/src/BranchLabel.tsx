import * as React from "react";
import { Branch, Commit } from "@gitgraph/core";

interface Props {
  branch: Branch<React.ReactElement<SVGElement>>;
  commit: Commit<React.ReactElement<SVGElement>>;
}

interface State {
  textWidth: number;
  textHeight: number;
}

export class BranchLabel extends React.Component<Props, State> {
  public static readonly paddingX = 10;
  public static readonly paddingY = 5;
  public readonly state = { textWidth: 0, textHeight: 0 };

  private $text = React.createRef<SVGTextElement>();

  public componentDidMount() {
    const box = this.$text.current!.getBBox();
    this.setState({ textWidth: box.width, textHeight: box.height });
  }

  public render() {
    const { branch, commit } = this.props;

    const paddingX =
      branch.style.label.paddingX !== undefined
        ? branch.style.label.paddingX
        : BranchLabel.paddingX;
    const paddingY =
      branch.style.label.paddingY !== undefined
        ? branch.style.label.paddingY
        : BranchLabel.paddingY;
    const boxWidth = this.state.textWidth + 2 * paddingX;
    const boxHeight = this.state.textHeight + 2 * paddingY;

    return (
      <g>
        <rect
          stroke={branch.style.label.strokeColor || commit.style.color}
          fill={branch.style.label.bgColor}
          rx={branch.style.label.borderRadius}
          width={boxWidth}
          height={boxHeight}
        />
        <text
          ref={this.$text}
          fill={branch.style.label.color || commit.style.color}
          style={{ font: branch.style.label.font }}
          alignmentBaseline="middle"
          dominantBaseline="middle"
          x={paddingX}
          y={boxHeight / 2}
        >
          {branch.name}
        </text>
      </g>
    );
  }
}
