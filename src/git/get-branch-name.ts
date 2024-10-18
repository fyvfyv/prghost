import { SimpleGit } from '../api/simple-git';

export const getBranchName = async (): Promise<string> => {
    try {
        const branchSummary = await SimpleGit.branch();
        return branchSummary.current;
    } catch (error) {
        console.error('Error getting the current branch:', error);
        process.exit(1);
    }
};
