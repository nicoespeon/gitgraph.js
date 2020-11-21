import * as React from "react";
import { Branch, Commit, GitgraphCore } from "@gitgraph/core";
import { CommitElement, ReactSvgElement } from "./types";

interface BranchLabelBaseProps {
  branch: Branch<React.ReactElement<SVGElement>>;
  commit: Commit<React.ReactElement<SVGElement>>;
}

function DefaultBranchLabel({branch, commit}: BranchLabelBaseProps) {
  const [textSizing, setTextSizing] = React.useState({ textWidth: 0, textHeight: 0 })

  const getSizing = React.useCallback((node) => {
    const box = node.getBBox();
    setTextSizing({ textWidth: box.width, textHeight: box.height });
  }, [])

  const boxWidth = textSizing.textWidth + 2 * BranchLabel.paddingX;
  const boxHeight = textSizing.textHeight + 2 * BranchLabel.paddingY;

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
        ref={getSizing}
        fill={branch.style.label.color || commit.style.color}
        style={{ font: branch.style.label.font }}
        alignmentBaseline="middle"
        dominantBaseline="middle"
        x={BranchLabel.paddingX}
        y={boxHeight / 2}
      >
        {branch.name}
      </text>
    </g>
  );
}

interface BranchLabelProps extends BranchLabelBaseProps {
  gitgraph: GitgraphCore<ReactSvgElement>;
  initCommitElements: (commit: Commit<ReactSvgElement>) => void;
  commitsElements: {
    [commitHash: string]: CommitElement;
  };
}

export class BranchLabel extends React.Component<BranchLabelProps> {
  public static readonly paddingX = 10;
  public static readonly paddingY = 5;

  public render() {
    const {branch, commit} = this.props;
    if (!branch.style.label.display) return null;

    if (!this.props.gitgraph.branchLabelOnEveryCommit) {
      const commitHash = this.props.gitgraph.refs.getCommit(branch.name);
      if (commit.hash !== commitHash) return null;
    }

    // For the moment, we don't handle multiple branch labels.
    // To do so, we'd need to reposition each of them appropriately.
    if (commit.branchToDisplay !== branch.name) return null;

    const ref = this.createBranchLabelRef(commit);
    const branchLabel = branch.renderLabel ? (
      branch.renderLabel(branch)
    ) : (
      <DefaultBranchLabel branch={branch} commit={commit} />
    );

    if (this.props.gitgraph.isVertical) {
      return (
        <g key={branch.name} ref={ref}>
          {branchLabel}
        </g>
      );
    } else {
      const commitDotSize = commit.style.dot.size * 2;
      const horizontalMarginTop = 10;
      const y = commitDotSize + horizontalMarginTop;

      return (
        <g
          key={branch.name}
          ref={ref}
          transform={`translate(${commit.x}, ${y})`}
        >
          {branchLabel}
        </g>
      );
    }
  }

  private createBranchLabelRef(
    commit: Commit<ReactSvgElement>,
  ): React.RefObject<SVGGElement> {
    const ref = React.createRef<SVGGElement>();

    if (!this.props.commitsElements[commit.hashAbbrev]) {
      this.props.initCommitElements(commit);
    }

    this.props.commitsElements[commit.hashAbbrev].branchLabel = ref;

    return ref;
  }
}
