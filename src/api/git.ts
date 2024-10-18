import { SimpleGit } from './simple-git';

export class GitService {
    private api = SimpleGit;

    public async getBranchName(): Promise<string> {
        try {
            const branchSummary = await this.api.branch();
            return branchSummary.current;
        } catch (error) {
            console.error('Error getting the current branch:', error);
            process.exit(1);
        }
    }

    public async getRepoInfo(): Promise<
        { owner: string; repo: string; baseBranch: string } | undefined
    > {
        try {
            const remotes = await this.api.getRemotes(true);
            const originRemote = remotes.find(
                (remote) => remote.name === 'origin',
            );

            if (!originRemote) {
                throw new Error('No remote named origin found');
            }

            const remoteUrl = originRemote.refs.fetch;

            // Parse the owner and repo name from the remote URL (works for both SSH and HTTPS URLs)
            const regex = /[:\/]([^\/]+)\/(.+)\.git$/;
            const match = remoteUrl.match(regex);

            if (!match || match.length < 3) {
                throw new Error(
                    'Failed to parse repository name and owner from URL',
                );
            }

            const owner = match[1];
            const repo = match[2];

            const remoteShowOutput = await this.api.raw([
                'remote',
                'show',
                'origin',
            ]);

            const baseBranchMatch = remoteShowOutput.match(/HEAD branch: (.+)/);
            const baseBranch = baseBranchMatch ? baseBranchMatch[1] : 'main';

            return { owner, repo, baseBranch };
        } catch (error) {
            console.error('Error: ', error);
            process.exit(1);
        }
    }

    public async getCommitTitle(
        baseBranch: string,
        branchName: string,
    ): Promise<string> {
        try {
            const log = await this.api.log({
                from: branchName,
                to: baseBranch,
            });

            if (!log.all.length) {
                throw new Error(`No commits found on branch ${branchName}`);
            }

            return log.all[log.all.length - 1].message.split('\n')[0]; // First line is the commit title
        } catch (error) {
            console.error(
                `Error fetching commits for branch ${branchName}:`,
                error,
            );
            throw error;
        }
    }
}
