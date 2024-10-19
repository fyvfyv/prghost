import { GitService } from './api/git';
import { GitHubService } from './api/github';
import { askForContext } from './utils/ask-context';
import { envs } from './utils/envs';
import { getGuidelines } from './utils/guidelines/get-guidelines';

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

    const context = await askForContext();
    const guidelines = getGuidelines();
    const diff = await githubService.getPRDiff(prNumber);

    return currentBranch;
}

run();
