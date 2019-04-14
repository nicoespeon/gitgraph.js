/// <reference types="react" />
export { GraphContainer, createFixedHashGenerator, createSvg, createG, createText, createPath, createForeignObject, };
declare function createFixedHashGenerator(): () => string;
/**
 * A React container to wrap HTMLElement so we can render @gitgraph/js
 * stories with @storybook/react.
 * We need to because Chromatic QA only handle 1 Storybook / repo.
 * And Storybook doesn't run multiple frameworks in 1 Storybook (yet).
 * See https://github.com/storybooks/storybook/issues/3994
 */
declare function GraphContainer(props: {
    children: (graphContainer: HTMLElement) => void;
}): JSX.Element;
interface SVGOptions {
    viewBox?: string;
    height?: number;
    width?: number;
    children?: SVGElement[];
}
declare function createSvg(options?: SVGOptions): SVGSVGElement;
interface GOptions {
    children: Array<SVGElement | null>;
    translate?: {
        x: number;
        y: number;
    };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
}
declare function createG(options: GOptions): SVGGElement;
interface TextOptions {
    content: string;
    fill?: string;
    font?: string;
    anchor?: "start" | "middle" | "end";
    translate?: {
        x: number;
        y: number;
    };
    onClick?: () => void;
}
declare function createText(options: TextOptions): SVGTextElement;
interface PathOptions {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    translate?: {
        x: number;
        y: number;
    };
}
declare function createPath(options: PathOptions): SVGPathElement;
interface ForeignObjectOptions {
    content: string;
    width: number;
    translate?: {
        x: number;
        y: number;
    };
}
declare function createForeignObject(options: ForeignObjectOptions): SVGForeignObjectElement;
