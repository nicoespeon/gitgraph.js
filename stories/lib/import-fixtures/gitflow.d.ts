declare const _default: {
    refs: string[];
    hash: string;
    hashAbbrev: string;
    tree: string;
    treeAbbrev: string;
    parents: string[];
    parentsAbbrev: string[];
    author: {
        name: string;
        email: string;
        timestamp: number;
    };
    committer: {
        name: string;
        email: string;
        timestamp: number;
    };
    subject: string;
    body: string;
    notes: string;
    stats: {
        additions: number;
        deletions: number;
        file: string;
    }[];
}[];
export default _default;
