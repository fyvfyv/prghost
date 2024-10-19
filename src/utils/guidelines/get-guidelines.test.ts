import * as path from 'node:path';
import { getGuidelines } from './get-guidelines';

describe('getGuidelines', () => {
    it('Should throw an error if neither the target file nor the fallback file exists', () => {
        expect(() =>
            getGuidelines('non-existing-file.md', 'non-existing-file.md'),
        ).toThrowError(
            'Neither target file found in the current directory nor fallback file in script folder.',
        );
    });

    it('Should use fallback file', () => {
        vi.spyOn(console, 'log');
        getGuidelines('non-existing-file.md', '.pr_guidelines.md');
        expect(console.log).toHaveBeenCalledWith(
            'ℹ️ non-existing-file.md not found in the current directory. Using fallback file.',
        );
    });

    it('Should use target file', () => {
        vi.spyOn(console, 'log');
        const filePath = 'src/utils/guidelines/.pr_guidelines.md';
        getGuidelines(filePath);
        expect(console.log).toHaveBeenCalledWith(
            `ℹ️ Found ${filePath} in the current repository. Using it.`,
        );
    });
});
