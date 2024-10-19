import * as fs from 'node:fs';
import { getPRTemplate } from './get-pr-template';

vi.mock(import('node:fs'), async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        existsSync: vi.fn(),
        readFileSync: () => 'PR template content' as any,
    };
});

describe('getPRTemplate', () => {
    it('Should do nothing without the file', () => {
        expect(getPRTemplate()).toBeUndefined();
    });

    it('Should do nothing without the file', () => {
        vi.spyOn(console, 'log');
        vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);

        getPRTemplate();
        expect(console.log).toHaveBeenCalledWith(
            'ℹ️ Found PR template file. Using it.',
        );

        vi.resetAllMocks();
    });
});
