import type { BranchSummary } from 'simple-git';
import type { MockInstance } from 'vitest';
import { GitService } from './git';
import { SimpleGit } from './simple-git';

describe('GitService', () => {
    const gitService = new GitService();

    describe('getBranchName', () => {
        let mockBranch: MockInstance;

        beforeEach(() => {
            mockBranch = vi.spyOn(SimpleGit, 'branch');
        });

        afterEach(() => {
            mockBranch.mockRestore();
        });

        it('should return the current branch name', async () => {
            mockBranch.mockResolvedValueOnce({
                current: 'main',
            } as BranchSummary);
            const branchName = await gitService.getBranchName();
            expect(branchName).toBe('main');
        });

        it('should exit with an error if branch command fails', async () => {
            mockBranch.mockRejectedValueOnce('Error');
            await expect(gitService.getBranchName()).rejects.toThrow('Error');
        });
    });

    describe('getRepoInfo', () => {
        let mockGetRemotes: MockInstance;
        let mockGitRaw: MockInstance;

        beforeEach(() => {
            mockGetRemotes = vi.spyOn(SimpleGit, 'getRemotes');
            mockGitRaw = vi
                .spyOn(SimpleGit, 'raw')
                .mockReturnValue('HEAD branch: test' as never);
        });

        afterEach(() => {
            mockGetRemotes.mockRestore();
            mockGitRaw.mockRestore();
        });

        it('should return owner, baseBranch and repo when origin remote is present and URL is valid', async () => {
            const remotes = [
                {
                    name: 'origin',
                    refs: { fetch: 'git@github.com:owner/repo.git' },
                },
            ];
            mockGetRemotes.mockResolvedValueOnce(remotes);
            const result = await gitService.getRepoInfo();

            expect(result).toEqual({
                owner: 'owner',
                repo: 'repo',
                baseBranch: 'test',
            });
        });

        it('Should return default baseBranch as «main» when HEAD branch is not found', async () => {
            const remotes = [
                {
                    name: 'origin',
                    refs: { fetch: 'git@github.com:owner/repo.git' },
                },
            ];
            mockGetRemotes.mockResolvedValueOnce(remotes);
            mockGitRaw.mockReturnValueOnce('' as never);
            const result = await gitService.getRepoInfo();

            expect(result).toEqual({
                owner: 'owner',
                repo: 'repo',
                baseBranch: 'main',
            });
        });

        it('should throw an error if no origin remote is found', async () => {
            const remotes = [
                {
                    name: 'upstream',
                    refs: { fetch: 'git@github.com:owner/other-repo.git' },
                },
            ];
            mockGetRemotes.mockResolvedValueOnce(remotes);
            await expect(gitService.getRepoInfo()).rejects.toThrow(
                'No remote named origin found',
            );
        });

        it('should throw an error if the remote URL is not valid', async () => {
            const remotes = [
                {
                    name: 'origin',
                    refs: { fetch: 'invalid-url' },
                },
            ];
            mockGetRemotes.mockResolvedValueOnce(remotes);
            await expect(gitService.getRepoInfo()).rejects.toThrow(
                'Failed to parse repository name and owner from URL',
            );
        });

        it('should handle the error when getRemotes throws an exception', async () => {
            mockGetRemotes.mockRejectedValueOnce(new Error('getRemotes error'));
            await expect(gitService.getRepoInfo()).rejects.toThrow(
                'getRemotes error',
            );
        });
    });

    describe('getCommitTitle', () => {
        let mockLog: MockInstance;

        beforeEach(() => {
            mockLog = vi.spyOn(SimpleGit, 'log');
        });

        afterEach(() => {
            mockLog.mockRestore();
        });

        it('should return the oldest commit title', async () => {
            mockLog.mockResolvedValueOnce({
                all: [
                    { message: 'Second commit\n\nBody' },
                    { message: 'First commit\n\nBody' },
                ],
            });
            const title = await gitService.getCommitTitle(
                'main',
                'feature-branch',
            );
            expect(title).toBe('First commit');
        });

        it('should exit with an error if commits command fails', async () => {
            mockLog.mockRejectedValueOnce('Error');
            await expect(
                gitService.getCommitTitle('main', 'feature-branch'),
            ).rejects.toThrow('Error');
        });

        it('should throw an error if no commits are found', async () => {
            mockLog.mockResolvedValueOnce({ all: [] });
            await expect(
                gitService.getCommitTitle('main', 'feature-branch'),
            ).rejects.toThrow('No commits found on branch feature-branch');
        });
    });
});
