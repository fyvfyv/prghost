import simpleGit from 'simple-git';

const git = simpleGit();

export const getBranchName = async (): Promise<string> => {
    try {
        const branchSummary = await git.branch();
        return branchSummary.current;
    } catch (error) {
        console.error('Error getting the current branch:', error);
        process.exit(1);
    }
};
