import type { Octokit } from '@octokit/rest';
import { GitHubService } from './github';

describe('GitHubService', () => {
    const mockOwner = 'mockOwner';
    const mockRepo = 'mockRepo';
    const mockToken = 'mockToken';
    const mockBaseBranch = 'main';
    let githubService: GitHubService;
    let api: Octokit;

    beforeEach(() => {
        githubService = new GitHubService({
            owner: mockOwner,
            repo: mockRepo,
            token: mockToken,
            baseBranch: mockBaseBranch,
        });

        api = (githubService as unknown as { api: Octokit }).api;
    });

    describe('getOrCreatePR', () => {
        it('should return existing PR number if it exists', async () => {
            const branchName = 'feature-branch';
            const prNumber = 123;

            vi.spyOn(api.pulls, 'list').mockResolvedValueOnce({
                data: [{ number: prNumber }],
            } as any);

            const result = await githubService.getOrCreatePR(
                branchName,
                'PR Title',
            );

            expect(result).toBe(prNumber);
        });

        it('should throw an error if getting current PR fails', async () => {
            const branchName = 'feature-branch';
            const mockError = new Error('GitHub API error');

            vi.spyOn(api.pulls, 'list').mockRejectedValue(mockError);

            await expect(
                githubService.getOrCreatePR(branchName, 'PR Title'),
            ).rejects.toThrow('GitHub API error');
        });

        it('should create a new PR if no existing PR is found', async () => {
            const branchName = 'feature-branch';
            const prNumber = 123;

            vi.spyOn(api.pulls, 'list').mockResolvedValueOnce({
                data: [],
            } as any);

            vi.spyOn(api.pulls, 'create').mockResolvedValueOnce({
                data: { number: prNumber },
            } as any);

            const result = await githubService.getOrCreatePR(
                branchName,
                'PR Title',
            );

            expect(result).toBe(prNumber);
        });

        it('should throw an error if creating the new PR fails', async () => {
            const branchName = 'feature-branch';
            const mockError = new Error('GitHub API error');

            vi.spyOn(api.pulls, 'list').mockResolvedValueOnce({
                data: [],
            } as any);

            vi.spyOn(api.pulls, 'create').mockRejectedValue(mockError);

            await expect(
                githubService.getOrCreatePR(branchName, 'PR Title'),
            ).rejects.toThrow('GitHub API error');
        });
    });

    describe('getPRDiff', () => {
        it('should return the diff for a pull request', async () => {
            const prNumber = 123;
            const mockDiff = 'mock diff';

            vi.spyOn(api.pulls, 'get').mockResolvedValueOnce({
                data: mockDiff,
            } as any);

            const result = await githubService.getPRDiff(prNumber);

            expect(result).toBe(mockDiff);
            expect(api.pulls.get).toHaveBeenCalledWith({
                owner: mockOwner,
                repo: mockRepo,
                pull_number: prNumber,
                mediaType: {
                    format: 'diff',
                },
            });
        });

        it('should throw an error if getting PR diff fails', async () => {
            const prNumber = 123;
            const mockError = new Error('GitHub API error');

            vi.spyOn(api.pulls, 'get').mockRejectedValueOnce(mockError);

            await expect(githubService.getPRDiff(prNumber)).rejects.toThrow(
                'GitHub API error',
            );
        });
    });

    describe('setPRDescription', () => {
        it('should set the description of a PR', async () => {
            const prNumber = 123;
            const description = 'New PR description';

            vi.spyOn(api.pulls, 'update').mockResolvedValueOnce({} as any);

            await githubService.setPRDescription(prNumber, description);

            expect(api.pulls.update).toHaveBeenCalledWith({
                owner: mockOwner,
                repo: mockRepo,
                pull_number: prNumber,
                body: description,
            });
        });

        it('should throw an error if setting PR description fails', async () => {
            const prNumber = 123;
            const description = 'New PR description';
            const mockError = new Error('GitHub API error');

            vi.spyOn(api.pulls, 'update').mockRejectedValueOnce(mockError);

            await expect(
                githubService.setPRDescription(prNumber, description),
            ).rejects.toThrow('GitHub API error');
        });
    });
});
