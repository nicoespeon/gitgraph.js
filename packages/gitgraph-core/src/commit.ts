import { CommitStyle, TagStyle } from "./template";
import { Branch } from "./branch";
import { Refs } from "./refs";
import { Tag } from "./tag";
import { GitgraphTagOptions } from "./user-api/gitgraph-user-api";

export { CommitRenderOptions, CommitOptions, Commit };

interface CommitRenderOptions<TNode> {
  renderDot?: (commit: Commit<TNode>) => TNode;
  renderMessage?: (commit: Commit<TNode>) => TNode;
  renderTooltip?: (commit: Commit<TNode>) => TNode;
}

interface CommitOptions<TNode> extends CommitRenderOptions<TNode> {
  author: string;
  subject: string;
  style: CommitStyle;
  body?: string;
  hash?: string;
  parents?: string[];
  dotText?: string;
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

class Commit<TNode = SVGElement> {
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
   * Message
   */
  public get message() {
    let message = "";

    if (this.style.message.displayHash) {
      message += `${this.hashAbbrev} `;
    }

    message += this.subject;

    if (this.style.message.displayAuthor) {
      message += ` - ${this.author.name} <${this.author.email}>`;
    }

    return message;
  }
  /**
   * Style
   */
  public style: CommitStyle;
  /**
   * Text inside commit dot
   */
  public dotText?: string;
  /**
   * List of branches attached
   */
  public branches?: Array<Branch["name"]>;
  /**
   * Branch that should be rendered
   */
  public get branchToDisplay(): Branch["name"] {
    return this.branches ? this.branches[0] : "";
  }
  /**
   * List of tags attached
   */
  public tags?: Array<Tag<TNode>>;
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
  public renderMessage?: (commit: Commit<TNode>) => TNode;
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

    // Set commit hash
    this.hash = options.hash || getRandomHash();
    this.hashAbbrev = this.hash.substring(0, 7);

    // Set parent hash
    this.parents = options.parents ? options.parents : [];
    this.parentsAbbrev = this.parents.map((commit) => commit.substring(0, 7));

    // Set style
    this.style = {
      ...options.style,
      message: { ...options.style.message },
      dot: { ...options.style.dot },
    };

    this.dotText = options.dotText;

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

  public setTags(
    tags: Refs,
    getTagStyle: (name: Tag<TNode>["name"]) => Partial<TagStyle>,
    getTagRender: (
      name: Tag<TNode>["name"],
    ) => GitgraphTagOptions<TNode>["render"],
  ): this {
    this.tags = tags
      .getNames(this.hash)
      .map(
        (name) =>
          new Tag(name, getTagStyle(name), getTagRender(name), this.style),
      );
    return this;
  }

  public setBranches(branches: Array<Branch["name"]>): this {
    this.branches = branches;
    return this;
  }

  public setPosition({ x, y }: { x: number; y: number }): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public withDefaultColor(color: string): Commit<TNode> {
    const newStyle = {
      ...this.style,
      dot: { ...this.style.dot },
      message: { ...this.style.message },
    };

    if (!newStyle.color) newStyle.color = color;
    if (!newStyle.dot.color) newStyle.dot.color = color;
    if (!newStyle.message.color) newStyle.message.color = color;

    const commit = this.cloneCommit();
    commit.style = newStyle;

    return commit;
  }

  /**
   * Ideally, we want Commit to be a [Value Object](https://martinfowler.com/bliki/ValueObject.html).
   * We started with a mutable class. So we'll refactor that little by little.
   * This private function is a helper to create a new Commit from existing one.
   */
  private cloneCommit() {
    const commit = new Commit({
      author: `${this.author.name} <${this.author.email}>`,
      subject: this.subject,
      style: this.style,
      body: this.body,
      hash: this.hash,
      parents: this.parents,
      dotText: this.dotText,
      onClick: this.onClick,
      onMessageClick: this.onMessageClick,
      onMouseOver: this.onMouseOver,
      onMouseOut: this.onMouseOut,
      renderDot: this.renderDot,
      renderMessage: this.renderMessage,
      renderTooltip: this.renderTooltip,
    });

    commit.refs = this.refs;
    commit.branches = this.branches;
    commit.tags = this.tags;
    commit.x = this.x;
    commit.y = this.y;

    return commit;
  }
}
