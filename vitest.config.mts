/// <reference types='vitest' />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        coverage: {
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.test.ts',
                'src/utils/ask-context.ts',
                'src/index.ts',
            ],
        },
    },
});
