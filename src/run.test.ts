import type { Mock } from 'vitest';
import { GitService } from './api/git';
import { GitHubService } from './api/github';
import { OpenAIService } from './api/openai';
import { run } from './run';
import { askForContext } from './utils/ask-context';
import { envs } from './utils/envs';
import { getPRTemplate } from './utils/get-pr-template';
import { getGuidelines } from './utils/guidelines/get-guidelines';
import { getPrompt } from './utils/prompt/prompt';

vi.mock('./api/git');
vi.mock('./api/github');
vi.mock('./api/openai');
vi.mock('./utils/ask-context');
vi.mock('./utils/envs');
vi.mock('./utils/get-pr-template');
vi.mock('./utils/guidelines/get-guidelines');
vi.mock('./utils/prompt/prompt');

describe('run', () => {
    it('should run successfully and generate PR description', async () => {
        const mockGitService = {
            getBranchName: vi.fn().mockResolvedValue('feature-branch'),
            getRepoInfo: vi.fn().mockResolvedValue({
                owner: 'test-owner',
                repo: 'test-repo',
                baseBranch: 'main',
            }),
            getCommitTitle: vi.fn().mockResolvedValue('Commit title'),
        };
        (GitService as Mock).mockImplementation(() => mockGitService);

        const mockGitHubService = {
            getOrCreatePR: vi.fn().mockResolvedValue(123),
            getPRDiff: vi.fn().mockResolvedValue('PR diff content'),
            setPRDescription: vi.fn().mockResolvedValue(''),
        };
        (GitHubService as Mock).mockImplementation(() => mockGitHubService);

        const mockOpenAIService = {
            getPRDescription: vi
                .fn()
                .mockResolvedValue('Generated PR description'),
        };
        (OpenAIService as Mock).mockImplementation(() => mockOpenAIService);

        (envs as Mock).mockReturnValue({
            github: 'github-token',
            openai: 'openai-token',
        });
        (askForContext as Mock).mockResolvedValue('context-value');
        (getGuidelines as Mock).mockReturnValue('guidelines-content');
        (getPRTemplate as Mock).mockReturnValue('pr-template-content');
        (getPrompt as Mock).mockReturnValue('generated-prompt');

        await run();

        expect(mockGitService.getBranchName).toHaveBeenCalled();
        expect(mockGitService.getRepoInfo).toHaveBeenCalled();
        expect(mockGitService.getCommitTitle).toHaveBeenCalledWith(
            'main',
            'feature-branch',
        );
        expect(mockGitHubService.getOrCreatePR).toHaveBeenCalledWith(
            'feature-branch',
            'Commit title',
        );
        expect(mockGitHubService.getPRDiff).toHaveBeenCalledWith(123);
        expect(mockOpenAIService.getPRDescription).toHaveBeenCalledWith(
            'generated-prompt',
            {
                withContext: true,
                withTemplate: true,
            },
        );
        expect(mockGitHubService.setPRDescription).toHaveBeenCalledWith(
            123,
            'Generated PR description',
        );
    });

    it('should exit if repo info is not found', async () => {
        const mockGitService = {
            getBranchName: vi.fn().mockResolvedValue('feature-branch'),
            getRepoInfo: vi.fn().mockResolvedValue(null),
        };
        (GitService as Mock).mockImplementation(() => mockGitService);

        console.error = vi.fn();

        await run();

        expect(console.error).toHaveBeenCalledWith(
            '❌ Error: Repository information not found',
        );
    });

    it('should exit if PR description is not generated', async () => {
        const mockGitService = {
            getBranchName: vi.fn().mockResolvedValue('feature-branch'),
            getRepoInfo: vi.fn().mockResolvedValue({
                owner: 'test-owner',
                repo: 'test-repo',
                baseBranch: 'main',
            }),
            getCommitTitle: vi.fn().mockResolvedValue('Commit title'),
        };
        (GitService as Mock).mockImplementation(() => mockGitService);

        const mockGitHubService = {
            getOrCreatePR: vi.fn().mockResolvedValue(123),
            getPRDiff: vi.fn().mockResolvedValue('PR diff content'),
        };
        (GitHubService as Mock).mockImplementation(() => mockGitHubService);

        const mockOpenAIService = {
            getPRDescription: vi.fn().mockResolvedValue(null),
        };
        (OpenAIService as Mock).mockImplementation(() => mockOpenAIService);
        console.error = vi.fn();

        await run();

        expect(console.error).toHaveBeenCalledWith(
            '❌ Error: PR description not generated',
        );
    });

    it('should exit if PR number is not found', async () => {
        const mockGitService = {
            getBranchName: vi.fn().mockResolvedValue('feature-branch'),
            getRepoInfo: vi.fn().mockResolvedValue({
                owner: 'test-owner',
                repo: 'test-repo',
                baseBranch: 'main',
            }),
            getCommitTitle: vi.fn().mockResolvedValue('Commit title'),
        };
        (GitService as Mock).mockImplementation(() => mockGitService);

        const mockGitHubService = {
            getOrCreatePR: vi.fn().mockResolvedValue(null),
            getPRDiff: vi.fn().mockResolvedValue('PR diff content'),
        };
        (GitHubService as Mock).mockImplementation(() => mockGitHubService);

        const mockOpenAIService = {
            getPRDescription: vi.fn().mockResolvedValue(null),
        };
        (OpenAIService as Mock).mockImplementation(() => mockOpenAIService);
        console.error = vi.fn();

        await run();

        expect(console.error).toHaveBeenCalledWith(
            '❌ Error: PR number not found',
        );
    });
});
