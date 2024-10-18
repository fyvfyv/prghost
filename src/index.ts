import { GitService } from './api/git';
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
}

run();
