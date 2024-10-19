import chalk from 'chalk';
import { GitService } from './api/git';
import { GitHubService } from './api/github';
import { OpenAIService } from './api/openai';
import { askForContext } from './utils/ask-context';
import { envs } from './utils/envs';
import { getPRTemplate } from './utils/get-pr-template';
import { getGuidelines } from './utils/guidelines/get-guidelines';
import { getPrompt } from './utils/prompt/prompt';

export const run = async () => {
    const tokens = envs();

    const gitService = new GitService();

    const currentBranch = await gitService.getBranchName();
    const repoInfo = await gitService.getRepoInfo();

    if (!repoInfo) {
        console.error('❌ Error: Repository information not found');
        return;
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
        console.error('❌ Error: PR number not found');
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
        console.error('❌ Error: PR description not generated');
        return;
    }

    await githubService.setPRDescription(prNumber, description);
    console.log(
        chalk.bold.green('✅ PR description has been successfully updated'),
    );
};
