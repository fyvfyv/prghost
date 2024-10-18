import { GitService } from './api/git';
import { GitHubService } from './api/github';
import { envs } from './utils/envs';

async function run() {
    const tokens = envs();

    const gitService = new GitService();

    const currentBranch = await gitService.getBranchName();
    const repoInfo = await gitService.getRepoInfo();

    if (!repoInfo) {
        console.error('Error: Repository information not found');
        process.exit(1);
    }

    const githubService = new GitHubService({
        ...repoInfo,
        token: tokens.github,
    });

    const title = await gitService.getCommitTitle(
        repoInfo.baseBranch,
        currentBranch,
    );

    const prNumber = await githubService.getOrCreatePR(currentBranch, title);

    if (!prNumber) {
        return;
    }

    return currentBranch;
}

run();
