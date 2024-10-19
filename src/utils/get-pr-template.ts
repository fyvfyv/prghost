import * as fs from 'node:fs';
import * as path from 'node:path';

const TARGET_FILE = 'pull_request_template.md';

export function getPRTemplate(): string | undefined {
    const currentDir: string = process.cwd();
    const targetFilePath: string = path.join(
        currentDir,
        '.github',
        TARGET_FILE,
    );

    if (fs.existsSync(targetFilePath)) {
        console.log('ℹ️ Found PR template file. Using it.');
        return fs.readFileSync(targetFilePath, 'utf-8');
    }

    return;
}
