import { CommitStyle } from "./template";
import Branch from "./branch";
import Refs from "./refs";

export interface CommitRenderOptions<TNode> {
  renderDot?: (commit: Commit<TNode>) => TNode;
  renderMessage?: (commit: Commit<TNode>, commitMessagesX: number) => TNode;
  renderTooltip?: (commit: Commit<TNode>) => TNode;
}

export interface CommitOptions<TNode> extends CommitRenderOptions<TNode> {
  author: string;
  subject: string;
  style: CommitStyle;
  body?: string;
  notes?: string;
  refs?: string[];
  tree?: string;
  hash?: string;
  parents?: string[];
  innerText?: string;
  onClick?: (commit: Commit<TNode>) => void;
  onMessageClick?: (commit: Commit<TNode>) => void;
  onMouseOver?: (commit: Commit<TNode>) => void;
  onMouseOut?: (commit: Commit<TNode>) => void;
}

/**
 * Generate a random hash.
 *
 * @return hex string with 40 chars
 */
const getRandomHash = () =>
  (
    Math.random()
      .toString(16)
      .substring(3) +
    Math.random()
      .toString(16)
      .substring(3) +
    Math.random()
      .toString(16)
      .substring(3) +
    Math.random()
      .toString(16)
      .substring(3)
  ).substring(0, 40);

export class Commit<TNode = SVGElement> {
  /**
   * Ref names
   */
  public refs: Array<Branch["name"] | "HEAD"> = [];
  /**
   * Commit x position
   */
  public x: number = 0;
  /**
   * Commit y position
   */
  public y: number = 0;
  /**
   * Commit hash
   */
  public hash: string;
  /**
   * Abbreviated commit hash
   */
  public hashAbbrev: string;
  /**
   * Tree hash
   */
  public tree: string;
  /**
   * Abbreviated tree hash
   */
  public treeAbbrev: string;
  /**
   * Parent hashes
   */
  public parents: Array<Commit<TNode>["hash"]>;
  /**
   * Abbreviated parent hashed
   */
  public parentsAbbrev: Array<Commit<TNode>["hashAbbrev"]>;
  /**
   * Author
   */
  public author: {
    /**
     * Author name
     */
    name: string;
    /**
     * Author email
     */
    email: string;
    /**
     * Author date
     */
    timestamp: number;
  };
  /**
   * Committer
   */
  public committer: {
    /**
     * Commiter name
     */
    name: string;
    /**
     * Commiter email
     */
    email: string;
    /**
     * Commiter date
     */
    timestamp: number;
  };
  /**
   * Subject
   */
  public subject: string;
  /**
   * Body
   */
  public body: string;
  /**
   * Notes
   */
  public notes: string;
  /**
   * Style
   */
  public style: CommitStyle;
  /**
   * Inner text
   */
  public innerText?: string;
  /**
   * List of branches attached
   */
  public branches?: Array<Branch["name"]>;
  /**
   * Branch that should be rendered
   */
  public branchToDisplay?: Branch["name"];
  /**
   * List of tags attached
   */
  public tags?: string[];
  /**
   * Callback to execute on click.
   */
  public onClick: () => void;
  /**
   * Callback to execute on click on the commit message.
   */
  public onMessageClick: () => void;
  /**
   * Callback to execute on mouse over.
   */
  public onMouseOver: () => void;
  /**
   * Callback to execute on mouse out.
   */
  public onMouseOut: () => void;
  /**
   * Custom dot render
   */
  public renderDot?: (commit: Commit<TNode>) => TNode;
  /**
   * Custom message render
   */
  public renderMessage?: (
    commit: Commit<TNode>,
    commitMessagesX: number,
  ) => TNode;
  /**
   * Custom tooltip render
   */
  public renderTooltip?: (commit: Commit<TNode>) => TNode;

  constructor(options: CommitOptions<TNode>) {
    // Set author & committer
    let name, email;
    try {
      [, name, email] = options.author.match(/(.*) <(.*)>/) as RegExpExecArray;
    } catch (e) {
      [name, email] = [options.author, ""];
    }
    this.author = { name, email, timestamp: Date.now() };
    this.committer = { name, email, timestamp: Date.now() };

    // Set commit message
    this.subject = options.subject;
    this.body = options.body || "";
    this.notes = options.notes || "";

    // Set commit hash
    this.hash = options.hash || getRandomHash();
    this.hashAbbrev = this.hash.substring(0, 7);

    // Set refs
    this.refs = options.refs || [];

    // Set tree hash
    this.tree = options.tree || getRandomHash();
    this.treeAbbrev = this.tree.substring(0, 7);

    // Set parent hash
    this.parents = options.parents ? options.parents : [];
    this.parentsAbbrev = this.parents.map((commit) => commit.substring(0, 7));

    // Set style
    this.style = {
      ...options.style,
      tag: { ...options.style.tag },
      message: { ...options.style.message },
      dot: { ...options.style.dot },
    };

    // Set inner text
    this.innerText = options.innerText;

    // Set callbacks
    this.onClick = () => (options.onClick ? options.onClick(this) : undefined);
    this.onMessageClick = () =>
      options.onMessageClick ? options.onMessageClick(this) : undefined;
    this.onMouseOver = () =>
      options.onMouseOver ? options.onMouseOver(this) : undefined;
    this.onMouseOut = () =>
      options.onMouseOut ? options.onMouseOut(this) : undefined;

    // Set custom renders
    this.renderDot = options.renderDot;
    this.renderMessage = options.renderMessage;
    this.renderTooltip = options.renderTooltip;
  }

  public setRefs(refs: Refs): this {
    this.refs = refs.getNames(this.hash);
    return this;
  }

  public setTags(tags: Refs): this {
    this.tags = tags.getNames(this.hash);
    return this;
  }

  public setBranches(branches: Array<Branch["name"]>): this {
    this.branches = branches;
    return this;
  }

  public computeBranchToDisplay(): this {
    this.branchToDisplay = this.branches ? this.branches[0] : "";
    return this;
  }

  public setPosition({ x, y }: { x: number; y: number }): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public setDefaultColor(color: string): this {
    if (!this.style.color) this.style.color = color;
    if (!this.style.tag.color) this.style.tag.color = color;
    if (!this.style.dot.color) this.style.dot.color = color;
    if (!this.style.message.color) this.style.message.color = color;

    return this;
  }
}

export default Commit;
