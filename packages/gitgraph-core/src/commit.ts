import { CommitStyle } from "./template";
import Branch from "./branch";

export interface CommitOptions {
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
}

/**
 * Generate a random hash.
 *
 * @return {string} hex string with 40 chars
 */
const getRandomHash = () => (
  (Math.random()).toString(16).substring(3) +
  (Math.random()).toString(16).substring(3) +
  (Math.random()).toString(16).substring(3) +
  (Math.random()).toString(16).substring(3)
).substring(0, 40);

export class Commit {
  /**
   * Ref names (injected by Gitgraph.withRefsAndTags)
   */
  public refs: Array<Branch["name"] | "HEAD"> = [];
  /**
   * Commit x position (injected by Gitgraph.withPosition)
   */
  public x: number = 0;
  /**
   * Commit y position (injected by Gitgraph.withPosition)
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
  public parents: Array<Commit["hash"]>;
  /**
   * Abbreviated parent hashed
   */
  public parentsAbbrev: Array<Commit["hashAbbrev"]>;
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
   * List of branches attached (injected by Gitgraph.withBranches)
   */
  public branches?: Array<Branch["name"]>;
  /**
   * List of tags attached (injected by Gitgraph.withRefsAndTags)
   */
  public tags?: string[];

  constructor(options: CommitOptions) {
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

    // Set tree hash
    this.tree = options.tree || getRandomHash();
    this.treeAbbrev = this.tree.substring(0, 7);

    // Set parent hash
    this.parents = options.parents ? options.parents : [];
    this.parentsAbbrev = this.parents.map((commit) => commit.substring(0, 7));

    // Set style
    this.style = options.style;

    // Set inner text
    this.innerText = options.innerText;
  }

}

export default Commit;
