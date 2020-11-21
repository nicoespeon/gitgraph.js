import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Tag as CoreTag, Commit } from "@gitgraph/core";
import { CommitElement, ReactSvgElement } from "./types";

interface BaseTagProps {
  tag: CoreTag<React.ReactElement<SVGElement>>;
}

export const TAG_PADDING_X = 10;
export const TAG_PADDING_Y = 5;

export function DefaultTag(props: BaseTagProps) {
  const [state, setState] = useState({ textWidth: 0, textHeight: 0 });
  const $text = useRef<SVGTextElement>(null);

  useEffect(() => {
    const box = $text.current!.getBBox();
    setState({ textWidth: box.width, textHeight: box.height });
  }, []);

  const { tag } = props;

  const offset = tag.style.pointerWidth;
  const radius = tag.style.borderRadius;
  const boxWidth = offset + state.textWidth + 2 * TAG_PADDING_X;
  const boxHeight = state.textHeight + 2 * TAG_PADDING_Y;

  const path = [
    "M 0,0",
    `L ${offset},${boxHeight / 2}`,
    `V ${boxHeight / 2}`,
    `Q ${offset},${boxHeight / 2} ${offset + radius},${boxHeight / 2}`,
    `H ${boxWidth - radius}`,
    `Q ${boxWidth},${boxHeight / 2} ${boxWidth},${boxHeight / 2 - radius}`,
    `V ${-(boxHeight / 2 - radius)}`,
    `Q ${boxWidth},-${boxHeight / 2} ${boxWidth - radius},-${boxHeight / 2}`,
    `H ${offset + radius}`,
    `Q ${offset},-${boxHeight / 2} ${offset},-${boxHeight / 2}`,
    `V -${boxHeight / 2}`,
    "z",
  ].join(" ");

  return (
    <g>
      <path d={path} fill={tag.style.bgColor} stroke={tag.style.strokeColor} />
      <text
        ref={$text}
        fill={tag.style.color}
        style={{ font: tag.style.font }}
        alignmentBaseline="middle"
        dominantBaseline="middle"
        x={offset + TAG_PADDING_X}
        y={0}
      >
        {tag.name}
      </text>
    </g>
  );
}

interface TagProps extends BaseTagProps {
  commit: Commit<ReactSvgElement>;
  initCommitElements: (commit: Commit<ReactSvgElement>) => void;
  commitsElements: {
    [commitHash: string]: CommitElement;
  };
}

/**
 * This needs to be refactored into a functional component as well - likely
 * merged with DefaultTag with an early return instead
 */
export class Tag extends React.Component<TagProps> {
  public render() {
    const tag = this.props.tag;
    const commit = this.props.commit;
    const ref = this.createTagRef(commit);

    return (
      <g
        key={`${commit.hashAbbrev}-${tag.name}`}
        ref={ref}
        transform={`translate(0, ${commit.style.dot.size})`}
      >
        {tag.render ? tag.render(tag.name, tag.style) : <DefaultTag tag={tag} />}
      </g>
    );
  }

  private createTagRef(
    commit: Commit<ReactSvgElement>,
  ): React.RefObject<SVGGElement> {
    const ref = React.createRef<SVGGElement>();

    if (!this.props.commitsElements[commit.hashAbbrev]) {
      this.props.initCommitElements(commit);
    }

    this.props.commitsElements[commit.hashAbbrev].tags.push(ref);

    return ref;
  }
}

