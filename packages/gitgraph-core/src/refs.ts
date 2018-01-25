import { Commit } from "./commit";

export class Refs {
    private refs: Map<string, Commit>;
    private currentRef: string;

    constructor() {
        this.refs = new Map<string, Commit>();
        this.setCurrentRef('master');
    }

    has(name: string): boolean {
        return this.refs.has(name);
    }

    get(name: string): string {
        return this.refs.get(name);
    }

    set(name:string, commit: Commit): void {
        this.refs.set(name, commit);
    }

    getFromCommit(commit: Commit): string[] {
        return Array.from(this.refs.entries())
            .filter(([key, value]) => value === commit)
            .map(([key]) => key);
    }

    setCurrentRef(name: string): void {
        this.currentRef = name;
    }

    getCurrentRef(): string {
        return this.currentRef;
    }
}