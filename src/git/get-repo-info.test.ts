import {
    type MockInstance,
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { SimpleGit } from '../api/simple-git';
import { getRepoInfo } from './get-repo-info';

describe('getRepoInfo', () => {
    let mockGetRemotes: MockInstance;
    let mockExit: MockInstance;
    let consoleError: MockInstance;

    beforeEach(() => {
        mockGetRemotes = vi.spyOn(SimpleGit, 'getRemotes');
        mockExit = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined as never);
        consoleError = vi.spyOn(console, 'error');
    });

    afterEach(() => {
        mockGetRemotes.mockRestore();
        mockExit.mockRestore();
    });

    it('should return owner and repo when origin remote is present and URL is valid', async () => {
        const remotes = [
            {
                name: 'origin',
                refs: { fetch: 'git@github.com:owner/repo.git' },
            },
        ];
        mockGetRemotes.mockResolvedValueOnce(remotes);
        const result = await getRepoInfo();

        expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('should throw an error if no origin remote is found', async () => {
        const remotes = [
            {
                name: 'upstream',
                refs: { fetch: 'git@github.com:owner/other-repo.git' },
            },
        ];
        mockGetRemotes.mockResolvedValueOnce(remotes);
        const result = await getRepoInfo();

        expect(result).toBeUndefined();
        expect(consoleError).toHaveBeenCalledWith(
            'Error: ',
            new Error('No remote named origin found'),
        );
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should throw an error if the remote URL is not valid', async () => {
        const remotes = [
            {
                name: 'origin',
                refs: { fetch: 'invalid-url' },
            },
        ];
        mockGetRemotes.mockResolvedValueOnce(remotes);
        const result = await getRepoInfo();

        expect(result).toBeUndefined();
        expect(consoleError).toHaveBeenCalledWith(
            'Error: ',
            new Error('Failed to parse repository name and owner from URL'),
        );
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle the error when getRemotes throws an exception', async () => {
        mockGetRemotes.mockRejectedValueOnce(new Error('getRemotes error'));
        const result = await getRepoInfo();

        expect(result).toBeUndefined();
        expect(consoleError).toHaveBeenCalledWith(
            'Error: ',
            new Error('getRemotes error'),
        );
        expect(mockExit).toHaveBeenCalledWith(1);
    });
});
