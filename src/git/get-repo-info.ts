import { SimpleGit } from '../api/simple-git';

export const getRepoInfo = async (): Promise<
    { owner: string; repo: string; baseBranch: string } | undefined
> => {
    try {
        const remotes = await SimpleGit.getRemotes(true);
        const originRemote = remotes.find((remote) => remote.name === 'origin');

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

        const remoteShowOutput = await SimpleGit.raw(['remote', 'show', 'origin']);

        const baseBranchMatch = remoteShowOutput.match(/HEAD branch: (.+)/);
        const baseBranch = baseBranchMatch ? baseBranchMatch[1] : 'main';

        return { owner, repo, baseBranch };
    } catch (error) {
        console.error('Error: ', error);
        process.exit(1);
    }
};
