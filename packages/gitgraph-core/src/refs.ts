import Commit from "./commit";

export class Refs extends Map<Commit["hash"] | string, string[] | Commit["hash"]> {
    /**
     * Set a new ref.
     * This ref will be available with:
     * - `refs.get(${commitHash})` -> ref[]
     * - `refs.get(${refName})` -> Commit["hash"]
     *
     * @param name Name of the ref (ex: "master", "HEAD")
     * @param commitHash Commit hash
     */
    public set(name: string, commitHash: Commit["hash"]): this {
        // Remove old links
        const prevCommitHash = super.get(name) as Commit["hash"];
        let prevRefs;
        if (prevCommitHash) {
            prevRefs = (super.get(prevCommitHash) || []) as string[];
            super.set(prevCommitHash, prevRefs.filter((ref: string) => ref !== name));
        }

        // Update the ref -> commitHash link
        super.set(name, commitHash);

        // Update the commitHash -> [refs] link
        prevRefs = super.get(commitHash) as string[] | undefined;
        const nextRefs = prevRefs ? [...prevRefs, name] : [name];
        super.set(commitHash, nextRefs);

        return this;
    }
}

export default Refs;
