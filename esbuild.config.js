const esbuild = require('esbuild');

// Configuration for esbuild
esbuild
    .build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        platform: 'node',
        outfile: 'dist/index.js',
        banner: {
            js: '#!/usr/bin/env node',
        },
        sourcemap: false,
    })
    .catch(() => process.exit(1));
