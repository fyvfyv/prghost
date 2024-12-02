import { describe, expect, it } from 'vitest';
import { getPrompt } from './prompt';

describe('getPrompt', () => {
    it('should generate the correct prompt when all inputs are provided', () => {
        const result = getPrompt({
            guidelines: "Follow the team's coding standards.",
            diff: 'Modified function getPrompt to handle edge cases.',
            context: 'The change addresses issue #123 and improves code quality.',
            prTemplate: 'Please mention the issue number and provide testing instructions.',
        });

        const expectedOutput = `
Generate a PR description based on the following information.
Focus on concrete technical changes and avoid assumptions about business impact unless explicitly stated.

PR Guidelines:
Follow the team's coding standards.

Code Changes:
Modified function getPrompt to handle edge cases.

Requirements:
- Keep descriptions factual and based solely on the provided information
- Include technical details that are visible in the code changes
- Avoid speculative improvements or impacts

Additional Context (use this as the primary source for business justification):
The change addresses issue #123 and improves code quality.

Fill in the following PR template, preserving all existing formatting and sections:
Please mention the issue number and provide testing instructions.

Note: Only modify the sections meant to be filled. Keep all other parts of the template unchanged.
        `.trim();

        expect(result).toEqual(expectedOutput);
    });

    it('should generate the correct prompt when context is not provided', () => {
        const result = getPrompt({
            guidelines: "Follow the team's coding standards.",
            diff: 'Modified function getPrompt to handle edge cases.',
            prTemplate: 'Please mention the issue number and provide testing instructions.',
        });

        const expectedOutput = `
Generate a PR description based on the following information.
Focus on concrete technical changes and avoid assumptions about business impact unless explicitly stated.

PR Guidelines:
Follow the team's coding standards.

Code Changes:
Modified function getPrompt to handle edge cases.

Requirements:
- Keep descriptions factual and based solely on the provided information
- Include technical details that are visible in the code changes
- Avoid speculative improvements or impacts

Fill in the following PR template, preserving all existing formatting and sections:
Please mention the issue number and provide testing instructions.

Note: Only modify the sections meant to be filled. Keep all other parts of the template unchanged.
        `.trim();

        expect(result).toEqual(expectedOutput);
    });

    it('should generate the correct prompt when prTemplate is not provided', () => {
        const result = getPrompt({
            guidelines: "Follow the team's coding standards.",
            diff: 'Modified function getPrompt to handle edge cases.',
            context: 'The change addresses issue #123 and improves code quality.',
        });

        const expectedOutput = `
Generate a PR description based on the following information.
Focus on concrete technical changes and avoid assumptions about business impact unless explicitly stated.

PR Guidelines:
Follow the team's coding standards.

Code Changes:
Modified function getPrompt to handle edge cases.

Requirements:
- Keep descriptions factual and based solely on the provided information
- Include technical details that are visible in the code changes
- Avoid speculative improvements or impacts

Additional Context (use this as the primary source for business justification):
The change addresses issue #123 and improves code quality.
        `.trim();

        expect(result).toEqual(expectedOutput);
    });

    it('should generate the correct prompt when neither context nor prTemplate are provided', () => {
        const result = getPrompt({
            guidelines: "Follow the team's coding standards.",
            diff: 'Modified function getPrompt to handle edge cases.',
        });

        const expectedOutput = `
Generate a PR description based on the following information.
Focus on concrete technical changes and avoid assumptions about business impact unless explicitly stated.

PR Guidelines:
Follow the team's coding standards.

Code Changes:
Modified function getPrompt to handle edge cases.

Requirements:
- Keep descriptions factual and based solely on the provided information
- Include technical details that are visible in the code changes
- Avoid speculative improvements or impacts
        `.trim();

        expect(result).toEqual(expectedOutput);
    });
});
