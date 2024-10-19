import * as fs from 'node:fs';
import * as path from 'node:path';

const TARGET_FILE = '.pr_guidelines.md';

export function getGuidelines(): string {
    const currentDir: string = process.cwd();
    const scriptDir: string = __dirname;

    const targetFilePath: string = path.join(currentDir, TARGET_FILE);
    const fallbackFilePath: string = path.join(scriptDir, TARGET_FILE);

    if (fs.existsSync(targetFilePath)) {
        console.log(
            `Found ${TARGET_FILE} in the current directory: ${currentDir}`,
        );
        return fs.readFileSync(targetFilePath, 'utf-8');
    }

    if (fs.existsSync(fallbackFilePath)) {
        console.log(
            `${TARGET_FILE} not found in the current directory. Using fallback file.`,
        );
        return fs.readFileSync(fallbackFilePath, 'utf-8');
    }

    throw new Error(
        `Neither ${TARGET_FILE} found in the current directory nor fallback file in script folder.`,
    );
}
