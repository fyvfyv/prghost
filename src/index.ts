import { GitService } from './api/git';
import { GitHubService } from './api/github';
import { OpenAIService } from './api/openai';
import { askForContext } from './utils/ask-context';
import { envs } from './utils/envs';
import { getPRTemplate } from './utils/get-pr-template';
import { getGuidelines } from './utils/guidelines/get-guidelines';
import { getPrompt } from './utils/prompt/prompt';

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
    const prTemplate = getPRTemplate();
    const diff = await githubService.getPRDiff(prNumber);

    const prompt = getPrompt({
        guidelines,
        diff,
        context,
        prTemplate,
    });

    const openAIService = new OpenAIService(tokens.openai);

    const description = await openAIService.getPRDescription(prompt, {
        withContext: !!context,
        withTemplate: !!prTemplate,
    });

    if (!description) {
        console.error('Error: PR description not generated');
        process.exit(1);
    }

    await githubService.setPRDescription(prNumber, description);
}

run();
