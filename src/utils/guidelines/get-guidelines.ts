import * as fs from 'node:fs';
import * as path from 'node:path';

export const TARGET_FILE = '.pr_guidelines.md';

export function getGuidelines(
    filePath: string = TARGET_FILE,
    fallbackFile: string = TARGET_FILE,
): string {
    const currentDir: string = process.cwd();
    const scriptDir: string = __dirname;

    const targetFilePath: string = path.join(currentDir, filePath);
    const fallbackFilePath: string = path.join(scriptDir, fallbackFile);

    if (fs.existsSync(targetFilePath)) {
        console.log(`ℹ️ Found ${filePath} in the current repository. Using it.`);
        return fs.readFileSync(targetFilePath, 'utf-8');
    }

    if (fs.existsSync(fallbackFilePath)) {
        console.log(
            `ℹ️ ${filePath} not found in the current directory. Using fallback file.`,
        );
        return fs.readFileSync(fallbackFilePath, 'utf-8');
    }

    throw new Error(
        'Neither target file found in the current directory nor fallback file in script folder.',
    );
}
