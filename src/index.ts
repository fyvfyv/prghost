import chalk from 'chalk';
import { getBranchName, getRepoInfo } from './git';

async function run() {
    const currentBranch = await getBranchName();
    const repoInfo = await getRepoInfo();

    console.log('Current branch: ', chalk.bold.green(currentBranch));
    console.log('Repo info: ', chalk.bold.green(JSON.stringify(repoInfo)));

    return currentBranch;
}

run();
