import { Octokit } from '@octokit/rest';

export class GitHubService {
    private readonly owner: string;
    private readonly repo: string;
    private readonly baseBranch: string;
    private readonly api: Octokit;

    constructor({
        owner,
        repo,
        token,
        baseBranch = 'main',
    }: {
        owner: string;
        repo: string;
        token: string;
        baseBranch: string;
    }) {
        this.owner = owner;
        this.repo = repo;
        this.baseBranch = baseBranch;

        this.api = new Octokit({ auth: token });
    }

    public async getOrCreatePR(
        branchName: string,
        title: string,
    ): Promise<number> {
        const prNumber = await this.getPRNumberByBranchName(branchName);

        if (prNumber) {
            return prNumber;
        }

        return this.createPR(branchName, title);
    }

    public async getPRDiff(prNumber: number): Promise<string> {
        const { data: diff } = await this.api.pulls.get({
            owner: this.owner,
            repo: this.repo,
            pull_number: prNumber,
            mediaType: {
                format: 'diff',
            },
        });

        return diff as unknown as string;
    }

    public async setPRDescription(
        prNumber: number,
        description: string,
    ): Promise<void> {
        await this.api.pulls.update({
            owner: this.owner,
            repo: this.repo,
            pull_number: prNumber,
            body: description,
        });
    }

    private async createPR(branchName: string, title: string): Promise<number> {
        const { data: newPR } = await this.api.pulls.create({
            owner: this.owner,
            repo: this.repo,
            head: branchName,
            base: this.baseBranch,
            title,
        });

        return newPR.number;
    }

    private async getPRNumberByBranchName(
        branchName: string,
    ): Promise<number | null> {
        const { data: prs } = await this.api.pulls.list({
            owner: this.owner,
            repo: this.repo,
            head: `${this.owner}:${branchName}`,
        });

        return prs?.[0]?.number || null;
    }
}
