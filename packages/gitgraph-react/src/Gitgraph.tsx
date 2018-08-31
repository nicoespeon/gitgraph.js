import * as React from "react";
import {
  GitgraphCore,
  GitgraphOptions,
  Commit,
  Branch,
  Coordinate,
  MergeStyle,
} from "gitgraph-core/lib/index";
import { toSvgPath, arrowSvgPath } from "gitgraph-core/lib/utils";

export interface GitgraphProps {
  options?: GitgraphOptions;
  children: (gitgraph: GitgraphCore) => void;
}

export interface GitgraphState {
  commits: Commit[];
  branchesPaths: Map<Branch, Coordinate[][]>;
  commitMessagesX: number;
}

export class Gitgraph extends React.Component<GitgraphProps, GitgraphState> {
  public static defaultProps: Partial<GitgraphProps> = {
    options: {},
  };

  private gitgraph: GitgraphCore;

  constructor(props: GitgraphProps) {
    super(props);
    this.state = { commits: [], branchesPaths: new Map(), commitMessagesX: 0 };
    this.gitgraph = new GitgraphCore(props.options);
    this.gitgraph.subscribe(this.onGitgraphCoreRender.bind(this));
  }

  public render() {
    return (
      <svg width={1000} height={1000}>
        {this.renderBranches()}
        {this.renderCommits()}
      </svg>
    );
  }

  public componentDidMount() {
    this.props.children(this.gitgraph);
  }

  private renderBranches() {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier =
      this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;
    return Array.from(this.state.branchesPaths).map(
      ([branch, coordinates], i) => (
        <path
          key={branch.name}
          d={toSvgPath(coordinates, isBezier, this.gitgraph.isVertical)}
          fill="transparent"
          stroke={branch.computedColor}
          strokeWidth={branch.style.lineWidth}
          transform={`translate(${offset}, ${offset})`}
        />
      ),
    );
  }

  private renderCommits() {
    return this.state.commits.map((commit) => (
      <g
        key={commit.hashAbbrev}
        transform={`translate(${commit.x}, ${commit.y})`}
      >
        {/* Dot */}
        {/*
          In order to handle strokes, we need to do some complex stuff here… 😅

          Problem: strokes are drawn inside & outside the circle. The outside part get cropped (because the circle is now larger than computed).

          Solution:
          1. Create the circle in a <defs>
          2. Define a clip path that references the circle
          3. Use the clip path, adding the stroke.
          4. Double stroke width because half of it (outside part) is clipped.

          Ref.: https://stackoverflow.com/a/32162431/3911841

          P.S. there is a proposal for a stroke-alignment property,
          but it's still a W3C Draft ¯\_(ツ)_/¯
          https://svgwg.org/specs/strokes/#SpecifyingStrokeAlignment
        */}
        <defs>
          <circle
            id={commit.hash}
            cx={commit.style.dot.size}
            cy={commit.style.dot.size}
            r={commit.style.dot.size}
            fill={commit.style.dot.color as string}
          />
          <clipPath id={`clip-${commit.hash}`}>
            <use xlinkHref={`#${commit.hash}`} />
          </clipPath>
        </defs>

        <g
          onClick={commit.onClick}
          onMouseOver={commit.onMouseOver}
          onMouseOut={commit.onMouseOut}
        >
          <use
            xlinkHref={`#${commit.hash}`}
            clipPath={`url(#clip-${commit.hash})`}
            stroke={commit.style.dot.strokeColor}
            strokeWidth={
              commit.style.dot.strokeWidth && commit.style.dot.strokeWidth * 2
            }
          />
        </g>

        {/* Message */}
        {commit.style.message.display && (
          <text
            x={this.state.commitMessagesX - commit.x}
            y={commit.style.dot.size}
            alignmentBaseline="central"
            fill={commit.style.message.color}
            style={{ font: commit.style.message.font }}
          >
            {this.getMessage(commit)}
          </text>
        )}

        {/* Arrow */}
        {this.gitgraph.template.arrow.size &&
          commit.parents.map((parentHash) => {
            const parent = this.state.commits.find(
              ({ hash }) => hash === parentHash,
            ) as Commit;
            return this.drawArrow(parent, commit);
          })}
      </g>
    ));
  }

  private drawArrow(parent: Commit, commit: Commit) {
    const commitRadius = commit.style.dot.size;

    // Starting point, relative to commit
    const origin = {
      x: this.gitgraph.reverseArrow
        ? commitRadius + (parent.x - commit.x)
        : commitRadius,
      y: this.gitgraph.reverseArrow
        ? commitRadius + (parent.y - commit.y)
        : commitRadius,
    };

    return (
      <g transform={`translate(${origin.x}, ${origin.y})`}>
        <path
          d={arrowSvgPath(this.gitgraph, parent, commit)}
          fill={this.gitgraph.template.arrow.color!}
        />
      </g>
    );
  }

  private getMessage(commit: Commit): string {
    let message = "";

    if (commit.style.message.displayBranch) {
      message += `[${commit.branches![commit.branches!.length - 1]}`;
      if (commit.tags!.length) {
        message += `, ${commit.tags!.join(", ")}`;
      }
      message += `] `;
    }

    if (commit.style.message.displayHash) {
      message += `${commit.hashAbbrev} `;
    }

    message += commit.subject;

    if (commit.style.message.displayAuthor) {
      message += ` - ${commit.author.name} <${commit.author.email}>`;
    }

    return message;
  }

  private onGitgraphCoreRender() {
    const {
      commits,
      branchesPaths,
      commitMessagesX,
    } = this.gitgraph.getRenderedData();
    this.setState({ commits, branchesPaths, commitMessagesX });
  }
}

export default Gitgraph;
export * from "gitgraph-core/lib/index";
