import { Commit } from "./commit";

export { Refs };

type Name = string;

class Refs {
  private commitPerName = new Map<Name, Commit["hash"]>();
  private namesPerCommit = new Map<Commit["hash"], Name[]>();

  /**
   * Set a new reference to a commit hash.
   *
   * @param name Name of the ref (ex: "master", "v1.0")
   * @param commitHash Commit hash
   */
  public set(name: Name, commitHash: Commit["hash"]): this {
    const prevCommitHash = this.commitPerName.get(name);
    if (prevCommitHash) {
      this.removeNameFrom(prevCommitHash, name);
    }

    this.addNameTo(commitHash, name);
    this.addCommitTo(name, commitHash);

    return this;
  }

  /**
   * Get the commit hash associated with the given reference name.
   *
   * @param name Name of the ref
   */
  public getCommit(name: Name): Commit["hash"] | undefined {
    return this.commitPerName.get(name);
  }

  /**
   * Get the list of reference names associated with given commit hash.
   *
   * @param commitHash Commit hash
   */
  public getNames(commitHash: Commit["hash"]): Name[] {
    return this.namesPerCommit.get(commitHash) || [];
  }

  /**
   * Get all reference names known.
   */
  public getAllNames(): Name[] {
    return Array.from(this.commitPerName.keys());
  }

  /**
   * Returns true if given commit hash is referenced.
   *
   * @param commitHash Commit hash
   */
  public hasCommit(commitHash: Commit["hash"]): boolean {
    return this.namesPerCommit.has(commitHash);
  }

  /**
   * Returns true if given reference name exists.
   *
   * @param name Name of the ref
   */
  public hasName(name: Name): boolean {
    return this.commitPerName.has(name);
  }

  private removeNameFrom(commitHash: Commit["hash"], nameToRemove: Name): void {
    const names = this.namesPerCommit.get(commitHash) || [];

    this.namesPerCommit.set(
      commitHash,
      names.filter((name) => name !== nameToRemove),
    );
  }

  private addNameTo(commitHash: Commit["hash"], nameToAdd: Name): void {
    const prevNames = this.namesPerCommit.get(commitHash) || [];
    this.namesPerCommit.set(commitHash, [...prevNames, nameToAdd]);
  }

  private addCommitTo(name: Name, commitHashToAdd: Commit["hash"]): void {
    this.commitPerName.set(name, commitHashToAdd);
  }
}
