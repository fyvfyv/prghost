import type { BranchSummary } from 'simple-git';
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
import { getBranchName } from './get-branch-name';

describe('getBranchName', () => {
    let mockExit: MockInstance;
    let mockBranch: MockInstance;

    beforeEach(() => {
        mockExit = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined as never);
        mockBranch = vi.spyOn(SimpleGit, 'branch');
    });

    afterEach(() => {
        mockExit.mockRestore();
    });

    it('should return the current branch name', async () => {
        mockBranch.mockResolvedValueOnce({ current: 'main' } as BranchSummary);
        const branchName = await getBranchName();
        expect(branchName).toBe('main');
    });

    it('should exit with an error if branch command fails', async () => {
        mockBranch.mockRejectedValue('Reject');
        await getBranchName();
        expect(mockExit).toHaveBeenCalledWith(1);
    });
});
