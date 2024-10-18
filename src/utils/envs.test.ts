import { envs } from './envs';

describe('envs', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should return both GITHUB_TOKEN and OPENAI_TOKEN when they are set', () => {
        vi.stubEnv('GITHUB_TOKEN', 'mock-github-token');
        vi.stubEnv('OPENAI_TOKEN', 'mock-openai-token');

        const result = envs();
        expect(result).toEqual({
            github: 'mock-github-token',
            openai: 'mock-openai-token',
        });
    });

    it('should throw an error if GITHUB_TOKEN is not set', () => {
        vi.stubEnv('GITHUB_TOKEN', undefined);
        vi.stubEnv('OPENAI_TOKEN', 'mock-openai-token');

        expect(() => envs()).toThrow('GITHUB_TOKEN is not set');
    });

    it('should throw an error if OPENAI_TOKEN is not set', () => {
        vi.stubEnv('GITHUB_TOKEN', 'mock-github-token');
        vi.stubEnv('OPENAI_TOKEN', undefined);

        expect(() => envs()).toThrow('OPENAI_TOKEN is not set');
    });

    it('should throw an error if both GITHUB_TOKEN and OPENAI_TOKEN are not set', () => {
        vi.stubEnv('GITHUB_TOKEN', undefined);
        vi.stubEnv('OPENAI_TOKEN', undefined);

        expect(() => envs()).toThrow('GITHUB_TOKEN is not set');
    });
});
