import * as React from 'react';
import { CommitElement, ReactSvgElement } from "./types";
import { Commit } from "../../gitgraph-core/src";

interface MessageProps {
  commit: Commit<ReactSvgElement>;
  initCommitElements: (commit: Commit<ReactSvgElement>) => void;
  commitsElements: {
    [commitHash: string]: CommitElement;
  };
}

export class Message extends React.Component<MessageProps> {
  public render() {
    const commit = this.props.commit;
    const ref = this.createMessageRef(commit);

    if (commit.renderMessage) {
      return <g ref={ref}>{commit.renderMessage(commit)}</g>;
    }

    let body = null;
    if (commit.body) {
      body = (
        <foreignObject width="600" x="10">
          <p>{commit.body}</p>
        </foreignObject>
      );
    }

    // Use commit dot radius to align text with the middle of the dot.
    const y = commit.style.dot.size;

    return (
      <g ref={ref} transform={`translate(0, ${y})`}>
        <text
          alignmentBaseline="central"
          fill={commit.style.message.color}
          style={{ font: commit.style.message.font }}
          onClick={commit.onMessageClick}
        >
          {commit.message}
        </text>
        {body}
      </g>
    );
  }

  private createMessageRef(
    commit: Commit<ReactSvgElement>,
  ): React.RefObject<SVGGElement> {
    const ref = React.createRef<SVGGElement>();

    if (!this.props.commitsElements[commit.hashAbbrev]) {
      this.props.initCommitElements(commit);
    }

    this.props.commitsElements[commit.hashAbbrev].message = ref;

    return ref;
  }
}
