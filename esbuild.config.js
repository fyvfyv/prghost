const esbuild = require('esbuild');
const fs = require('node:fs').promises; // Use the promises API of fs for async/await
const path = require('node:path');

// File paths
const srcFilePath = path.join(
    __dirname,
    'src',
    'utils',
    'guidelines',
    '.pr_guidelines.md',
);
const destFilePath = path.join(__dirname, 'dist', '.pr_guidelines.md');

// Async function to handle the build and file copy process
async function buildAndCopy() {
    try {
        // Perform the esbuild process
        await esbuild.build({
            entryPoints: ['src/index.ts'],
            bundle: true,
            platform: 'node',
            outfile: 'dist/index.js',
            banner: {
                js: '#!/usr/bin/env node',
            },
            sourcemap: false,
        });

        console.log('Build completed.');

        // Copy the file after the build
        await fs.copyFile(srcFilePath, destFilePath);
        console.log('File copied successfully.');
    } catch (err) {
        console.error('Error during build or file copy:', err);
        process.exit(1);
    }
}

// Execute the function
buildAndCopy();
