export type BuildStruct = {
    backup?: boolean;
    checkout?: string;
    clear: boolean;
};
export type InstanceStruct = {
    backups?: string;
    build?: string;
    git: {
        checkout: boolean;
        submodules: boolean;
    };
    node: {
        force_install: string;
        nvm?: string;
        script?: string;
    };
    path: string;
    web_root: string;
};
