import chalk from 'chalk';
import { getBranchName } from './utils/get-branch-name';

async function run() {
    const currentBranch = await getBranchName();
    console.log('Current branch:', chalk.bold.green(currentBranch));

    return currentBranch;
}

run();
