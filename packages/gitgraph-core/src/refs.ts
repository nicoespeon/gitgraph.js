import { Commit } from "./commit";

export default class Refs {
    private refs: Map<string | Commit, Commit | string[]>;

    constructor() {
        this.refs = new Map<string | Commit, Commit | string[]>();
    }

    has(key: string | Commit): boolean {
        return this.refs.has(key);
    }

    get(key: string | Commit): string[] | Commit | undefined {
        return this.refs.get(key);
    }

    set(name: string, commit: Commit): void {
        // Remove old links
        const prevCommit = this.refs.get(name) as Commit;
        if (prevCommit) {
            const prevRefs = (this.refs.get(prevCommit) || []) as string[];
            this.refs.set(prevCommit, prevRefs.filter((ref: string) => ref !== name))
        }

        // Update the ref -> commit link
        this.refs.set(name, commit);

        // Update the commit -> [refs] link
        const prevRefs = this.refs.get(commit) as string[] | undefined;
        const nextRefs = prevRefs ? [...prevRefs, name] : [name]
        this.refs.set(commit, nextRefs);

    }
}